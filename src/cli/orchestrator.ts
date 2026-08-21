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
        // 1. Determine next targets: check if unexplored frontier exists; otherwise start with root
        const frontier = this.spkb.getUnexploredFrontier();
        const targetUrl = frontier.length > 0 ? frontier[0].url : this.options.targetUrl;

        // 2. Crawl the chosen target URL and map its downstream elements/transitions
        await this.crawler.crawl(page, targetUrl, {
            maxDepth: this.options.maxDepth || 1,
            maxPages: this.options.maxPages || 5
        });

        // 3. Query updated remaining frontier
        const remainingFrontier = this.spkb.getUnexploredFrontier();

        return {
            pagesExplored: 1,
            invariantsViolationsCount: 0,
            frontierRemaining: remainingFrontier.length
        };
    }
}
