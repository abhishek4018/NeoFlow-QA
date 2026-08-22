import { Page } from '@playwright/test';
import { SPKBDb } from '../spkb/db';
import { SiteCrawler } from '../explorer/crawler';
import { DOMExtractor } from '../explorer/dom-extractor';
import { NeoScriptSynthesizer } from '../ai/neo-synthesizer';
import { ASTAssertionLinter } from '../auditor/ast-linter';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface OrchestratorOptions {
    dbPath?: string;
    targetUrl: string;
    maxDepth?: number;
    maxPages?: number;
    maxAutoHealingAttempts?: number;
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
    private astLinter: ASTAssertionLinter;
    private options: OrchestratorOptions;

    constructor(options: OrchestratorOptions) {
        this.options = options;
        this.spkb = new SPKBDb(options.dbPath || 'spkb.db');
        this.crawler = new SiteCrawler(this.spkb);
        this.domExtractor = new DOMExtractor();
        this.synthesizer = new NeoScriptSynthesizer();
        this.astLinter = new ASTAssertionLinter();
    }

    public async runCycle(page: Page): Promise<CycleResult> {
        // 1. Determine next target from frontier
        const frontier = this.spkb.getUnexploredFrontier();
        const targetUrl = frontier.length > 0 ? frontier[0].url : this.options.targetUrl;

        // 2. Crawl the chosen target URL and map its downstream elements
        await this.crawler.crawl(page, targetUrl, {
            maxDepth: this.options.maxDepth || 1,
            maxPages: this.options.maxPages || 5
        });

        // 3. Extract active DOM actions for the current page
        const actions = await this.domExtractor.extractInteractiveElements(page);
        const title = await page.title();
        const flowName = this.synthesizer.sanitizeFilename(new URL(targetUrl).pathname.replace(/\//g, '') || 'home');

        let generatedScriptPath: string | undefined;

        // 4. Closed-Loop Agent Generation & Autonomous Healing (No Human Prompts)
        const maxHealingAttempts = this.options.maxAutoHealingAttempts || 3;
        let attempt = 0;
        let passed = false;
        let lastError = '';

        while (attempt < maxHealingAttempts && !passed) {
            attempt++;
            try {
                console.log(`\n🤖 [Agent Mode Attempt ${attempt}/${maxHealingAttempts}] Synthesizing test assets for [${flowName}]...`);
                
                // Stage 1: Generate Raw Playwright Spec
                const rawSpec = await this.synthesizer.generateRawSpec(targetUrl, title, actions);
                const rawPath = path.resolve(process.cwd(), `codegen/${flowName}_raw.spec.ts`);
                fs.writeFileSync(rawPath, rawSpec, 'utf-8');

                // Stage 2: Generate Serenity/JS BDD Assets (Deterministic Screenplay AST)
                const actionSelector = actions.length > 0 ? actions[0].selector : undefined;
                const bdd = await this.synthesizer.generateBDDAssets(flowName, rawSpec, targetUrl, {
                    header: 'body',
                    action: actionSelector
                });
                
                // Stage 2.5: AST Assertion Linting Gate
                const lintResult = this.astLinter.lint(bdd.steps);
                if (!lintResult.valid) {
                    lastError = `AST Linter rejection: ${lintResult.errors.join(', ')}`;
                    console.warn(`⚠️ AST Linter rejected step definitions:`, lintResult.errors);
                    continue; // Auto-retry next generation loop
                }

                const featurePath = path.resolve(process.cwd(), `features/codegen/${flowName}.feature`);
                const stepsPath = path.resolve(process.cwd(), `step-definitions/codegen/${flowName}.steps.ts`);

                fs.writeFileSync(featurePath, bdd.feature, 'utf-8');
                fs.writeFileSync(stepsPath, bdd.steps, 'utf-8');

                // Stage 3: Autonomous Verification Gate (Test compilation and execution)
                console.log(`🚦 [Agent Mode] Verifying generated test with Cucumber tag @${flowName}...`);
                execSync(`npx cucumber-js --profile default --tags "@${flowName}"`, { stdio: 'pipe' });

                console.log(`✅ [Agent Mode] Test validated and admitted into regression suite!`);
                
                // Compile Serenity HTML living report
                try {
                    console.log(`📊 [Agent Mode] Compiling Serenity BDD living documentation report...`);
                    execSync(`npx serenity-bdd run --features ./features`, { stdio: 'pipe' });
                    console.log(`📑 [Agent Mode] Serenity HTML Report generated at target/site/serenity/index.html`);
                } catch (reportErr: any) {
                    console.warn(`⚠️ [Agent Mode] Note: Serenity HTML report compiler notice:`, reportErr?.message);
                }

                passed = true;
                generatedScriptPath = rawPath;
            } catch (error: any) {
                const errorMessage = error?.stdout?.toString() || error?.stderr?.toString() || error?.message || 'Execution error';
                lastError = errorMessage.slice(0, 500);
                console.warn(`⚠️ [Agent Mode Self-Healing] Verification failed for attempt ${attempt}:`, lastError);

                if (attempt >= maxHealingAttempts) {
                    console.warn(`❌ [Agent Mode] Discarding unverified draft for ${flowName} to prevent breaking suite.`);
                    // Clean up broken draft so regression runner stays clean
                    const featurePath = path.resolve(process.cwd(), `features/codegen/${flowName}.feature`);
                    const stepsPath = path.resolve(process.cwd(), `step-definitions/codegen/${flowName}.steps.ts`);
                    if (fs.existsSync(featurePath)) fs.unlinkSync(featurePath);
                    if (fs.existsSync(stepsPath)) fs.unlinkSync(stepsPath);
                }
            }
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
