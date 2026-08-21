import { Page } from '@playwright/test';
import { SPKBDb } from '../spkb/db';
import { SiteCrawler } from '../explorer/crawler';
import { DOMExtractor } from '../explorer/dom-extractor';
import { NeoScriptSynthesizer } from '../ai/neo-synthesizer';
import * as fs from 'fs';
import * as path from 'path';

export interface OrchestratorOptions {
    dbPath?: string;
    targetUrl: string;
    maxDepth?: number;
    maxPages?: number;
}

export interface CycleResult {
    pagesExplored: number;
    invariantsViolationsCount: number;
    frontierRemaining: number;
    generatedScriptPath?: string;
}

export class AutonomousOrchestrator {
    private spkb: SPKBDb;
    private crawler: SiteCrawler;
    private domExtractor: DOMExtractor;
    private synthesizer: NeoScriptSynthesizer;
    private options: OrchestratorOptions;

    constructor(options: OrchestratorOptions) {
        this.options = options;
        this.spkb = new SPKBDb(options.dbPath || 'spkb.db');
        this.crawler = new SiteCrawler(this.spkb);
        this.domExtractor = new DOMExtractor();
        this.synthesizer = new NeoScriptSynthesizer();
    }

    public async runCycle(page: Page): Promise<CycleResult> {
        // 1. Determine next targets: check if unexplored frontier exists; otherwise start with root
        const frontier = this.spkb.getUnexploredFrontier();
        const targetUrl = frontier.length > 0 ? frontier[0].url : this.options.targetUrl;

        // 2. Crawl the chosen target URL and map its downstream elements/transitions
        await this.crawler.crawl(page, targetUrl, {
            maxDepth: this.options.maxDepth || 1,
            maxPages: this.options.maxPages || 5
        });

        // 3. Extract active DOM actions for the current page
        const actions = await this.domExtractor.extractInteractiveElements(page);
        const title = await page.title();
        const flowName = this.synthesizer.sanitizeFilename(new URL(targetUrl).pathname.replace(/\//g, '') || 'home');

        let generatedScriptPath: string | undefined;

        // 4. Generate AI scripts using local LLM
        try {
            console.log(`🧠 Synthesizing raw Playwright spec for [${title}] with LLM...`);
            const rawSpec = await this.synthesizer.generateRawSpec(targetUrl, title, actions);

            const rawPath = path.resolve(process.cwd(), `codegen/${flowName}_raw.spec.ts`);
            fs.writeFileSync(rawPath, rawSpec, 'utf-8');
            generatedScriptPath = rawPath;
            console.log(`✨ Generated: ${rawPath}`);

            console.log(`🎭 Synthesizing Serenity/JS BDD assets with LLM...`);
            const bdd = await this.synthesizer.generateBDDAssets(flowName, rawSpec);

            const featurePath = path.resolve(process.cwd(), `features/codegen/${flowName}.feature`);
            const stepsPath = path.resolve(process.cwd(), `step-definitions/codegen/${flowName}.steps.ts`);

            fs.writeFileSync(featurePath, bdd.feature, 'utf-8');
            fs.writeFileSync(stepsPath, bdd.steps, 'utf-8');
            console.log(`✨ Generated Feature: ${featurePath}`);
            console.log(`✨ Generated Steps: ${stepsPath}`);
        } catch (error) {
            console.warn(`⚠️ LLM synthesis skipped/failed for ${targetUrl}:`, error);
        }

        // 5. Query updated remaining frontier
        const remainingFrontier = this.spkb.getUnexploredFrontier();

        return {
            pagesExplored: 1,
            invariantsViolationsCount: 0,
            frontierRemaining: remainingFrontier.length,
            generatedScriptPath
        };
    }
}
