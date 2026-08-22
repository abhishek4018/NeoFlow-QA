import { Page } from '@playwright/test';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { NeoScriptSynthesizer } from '../ai/neo-synthesizer';
import { ASTAssertionLinter } from '../auditor/ast-linter';
import { SiteCrawler } from '../explorer/crawler';
import { DOMExtractor } from '../explorer/dom-extractor';
import { SPKBDb } from '../spkb/db';

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

        // 3. Extract active DOM actions and structural page inventory for the current page
        const actions = await this.domExtractor.extractInteractiveElements(page);
        const inventory = await this.domExtractor.extractPageInventory(page);
        const title = await page.title();
        const baseFlowName = this.synthesizer.sanitizeFilename(new URL(targetUrl).pathname.replace(/\//g, '') || 'home');
        let flowName = baseFlowName;
        let selectedActions = actions;

        // If the base route is already covered, target unexercised interactive action pathways
        const rawDb = (this.spkb as any).db;
        if (rawDb) {
            const isCovered = rawDb.prepare(`SELECT id FROM care_flows WHERE flow_name = ?`).get(baseFlowName);
            if (isCovered && actions.length > 0) {
                for (const act of actions) {
                    const actSlug = this.synthesizer.sanitizeFilename(act.label || '').slice(0, 30);
                    if (!actSlug || actSlug === baseFlowName) continue;
                    const candidateFlowName = `${baseFlowName}_${actSlug}`;
                    const candidateCovered = rawDb.prepare(`SELECT id FROM care_flows WHERE flow_name = ?`).get(candidateFlowName);
                    if (!candidateCovered) {
                        flowName = candidateFlowName;
                        selectedActions = [act, ...actions.filter(a => a !== act)];
                        break;
                    }
                }
            }
        }

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
                const rawSpec = await this.synthesizer.generateRawSpec(targetUrl, title, selectedActions);
                const rawPath = path.resolve(process.cwd(), `codegen/${flowName}_raw.spec.ts`);
                fs.writeFileSync(rawPath, rawSpec, 'utf-8');

                // Stage 2: Generate Serenity/JS BDD Assets (Deterministic Screenplay AST)
                const actionSelector = selectedActions.length > 0 ? selectedActions[0].selector : undefined;
                const actionLabel = selectedActions.length > 0 ? (selectedActions[0].label || flowName) : flowName;
                const bdd = await this.synthesizer.generateBDDAssets(flowName, rawSpec, targetUrl, {
                    header: 'h1, h2, h3, header, main, nav, a, button',
                    action: actionSelector,
                    actions: selectedActions,
                    baseRouteName: baseFlowName,
                    actionLabel,
                    inventory
                });
                
                // Stage 2.5: AST Assertion Linting Gate
                const lintResult = this.astLinter.lint(bdd.steps);
                if (!lintResult.valid) {
                    lastError = `AST Linter rejection: ${lintResult.errors.join(', ')}`;
                    console.warn(`⚠️ AST Linter rejected step definitions:`, lintResult.errors);
                    continue; // Auto-retry next generation loop
                }

                const featurePath = path.resolve(process.cwd(), `features/quickexamcreator/${flowName}.feature`);
                const stepsPath = path.resolve(process.cwd(), `step-definitions/quickexamcreator/${flowName}.steps.ts`);

                fs.writeFileSync(featurePath, bdd.feature, 'utf-8');
                fs.writeFileSync(stepsPath, bdd.steps, 'utf-8');

                // Stage 3: Autonomous Verification Gate (Test compilation and execution)
                console.log(`🚦 [Agent Mode] Verifying generated test with Cucumber tag @${flowName}...`);
                execSync(`npx cucumber-js --profile default --tags "@${flowName}"`, { stdio: 'pipe' });

                console.log(`✅ [Agent Mode] Test validated and admitted into regression suite!`);
                this.spkb.markPageExplored(targetUrl);

                // Update care_flows in knowledge base
                const rawDb = (this.spkb as any).db;
                if (rawDb) {
                    const sig = crypto.createHash('sha256').update(bdd.feature).digest('hex');
                    rawDb.prepare(`
                        INSERT OR REPLACE INTO care_flows (flow_name, flow_signature, feature_path, steps_path, last_verified_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `).run(flowName, sig, `features/quickexamcreator/${flowName}.feature`, `step-definitions/quickexamcreator/${flowName}.steps.ts`);
                }
                
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
                    this.spkb.markPageExplored(targetUrl);
                    // Clean up broken draft so regression runner stays clean
                    const featurePath = path.resolve(process.cwd(), `features/quickexamcreator/${flowName}.feature`);
                    const stepsPath = path.resolve(process.cwd(), `step-definitions/quickexamcreator/${flowName}.steps.ts`);
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
