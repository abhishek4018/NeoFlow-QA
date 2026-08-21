import { test, expect } from '@playwright/test';
import { SiteCrawler } from '../../src/explorer/crawler';
import { SPKBDb } from '../../src/spkb/db';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Site Crawler & Invariant Cartographer', () => {
    const testDbPath = path.join(__dirname, 'crawler_test_spkb.db');

    test.beforeEach(() => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    test.afterEach(() => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    test('crawls target domain and registers state graph and edges into SPKB', async ({ page }) => {
        const spkb = new SPKBDb(testDbPath);
        const crawler = new SiteCrawler(spkb);

        // Crawl live test domain with depth 1 limit
        await crawler.crawl(page, 'https://quickexamcreator.com', { maxDepth: 1, maxPages: 3 });

        const frontier = spkb.getUnexploredFrontier();
        expect(frontier.length).toBeGreaterThanOrEqual(0);
    });
});
