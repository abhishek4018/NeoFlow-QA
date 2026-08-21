import { Page } from '@playwright/test';
import { SPKBDb } from '../spkb/db';
import { SiteCrawler } from '../explorer/crawler';

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
}

export class AutonomousOrchestrator {
    private spkb: SPKBDb;
    private crawler: SiteCrawler;
    private options: OrchestratorOptions;

    constructor(options: OrchestratorOptions) {
        this.options = options;
        this.spkb = new SPKBDb(options.dbPath || 'spkb.db');
        this.crawler = new SiteCrawler(this.spkb);
    }

    public async runCycle(page: Page): Promise<CycleResult> {
        // 1. Crawl & Invariant Monitor
        await this.crawler.crawl(page, this.options.targetUrl, {
            maxDepth: this.options.maxDepth || 1,
            maxPages: this.options.maxPages || 5
        });

        // 2. Query Frontier & Violations
        const frontier = this.spkb.getUnexploredFrontier();

        return {
            pagesExplored: 1,
            invariantsViolationsCount: 0,
            frontierRemaining: frontier.length
        };
    }
}
