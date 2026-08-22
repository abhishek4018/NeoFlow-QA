import { Page } from '@playwright/test';

import { SPKBDb } from '../spkb/db';
import { InvariantsEngine } from '../spkb/invariants-engine';
import { TelemetryEvent } from '../spkb/types';
import { DOMExtractor } from './dom-extractor';

export interface CrawlOptions {
    maxDepth?: number;
    maxPages?: number;
}

export class SiteCrawler {
    private spkb: SPKBDb;
    private invariantsEngine: InvariantsEngine;
    private domExtractor: DOMExtractor;

    constructor(spkb: SPKBDb) {
        this.spkb = spkb;
        this.invariantsEngine = new InvariantsEngine();
        this.domExtractor = new DOMExtractor();
    }

    public async crawl(page: Page, rootUrl: string, options: CrawlOptions = {}): Promise<void> {
        const maxPages = options.maxPages || 5;
        const visitedUrls = new Set<string>();
        const telemetryEvents: TelemetryEvent[] = [];

        // Attach Telemetry Monitors
        page.on('console', (msg) => {
            const level = msg.type() === 'error' ? 'error' : msg.type() === 'warning' ? 'warn' : 'info';
            telemetryEvents.push({
                type: 'console',
                level,
                message: msg.text(),
                timestamp: new Date().toISOString()
            });
        });

        page.on('response', (response) => {
            telemetryEvents.push({
                type: 'network',
                status: response.status(),
                url: response.url(),
                timestamp: new Date().toISOString()
            });
        });

        // 1. Visit Root Node
        await page.goto(rootUrl, { waitUntil: 'domcontentloaded' });
        visitedUrls.add(rootUrl);

        const currentTitle = await page.title();
        const rootRoute = new URL(rootUrl).pathname || '/';

        const rootNode = this.spkb.insertPageNode({
            url: rootUrl,
            title: currentTitle,
            routePath: rootRoute,
            discoveredAt: new Date().toISOString(),
            status: 'explored'
        });

        // Evaluate Telemetry for Root
        const violations = this.invariantsEngine.evaluateEvents(telemetryEvents, rootNode.id);
        for (const v of violations) {
            this.spkb.recordViolation(v);
        }

        // 2. Extract DOM interactive elements
        const actions = await this.domExtractor.extractInteractiveElements(page);

        for (const action of actions) {
            if (action.targetUrl && (action.targetUrl.startsWith('/') || action.targetUrl.startsWith(rootUrl))) {
                const absoluteUrl = new URL(action.targetUrl, rootUrl).toString();
                const routePath = new URL(absoluteUrl).pathname;

                if (!visitedUrls.has(absoluteUrl) && visitedUrls.size < maxPages) {
                    const childNode = this.spkb.insertPageNode({
                        url: absoluteUrl,
                        title: action.label,
                        routePath,
                        discoveredAt: new Date().toISOString(),
                        status: 'unexplored'
                    });

                    if (rootNode.id && childNode.id) {
                        this.spkb.insertTransitionEdge({
                            fromNodeId: rootNode.id,
                            toNodeId: childNode.id,
                            actionType: action.actionType,
                            targetSelector: action.selector,
                            actionLabel: action.label,
                            weight: 1.0
                        });
                    }
                }
            }
        }
    }
}
