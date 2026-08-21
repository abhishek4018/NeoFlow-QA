#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { AutonomousOrchestrator } from './orchestrator';

async function main() {
    const targetUrl = process.argv[2] || process.env.TARGET_URL || 'https://quickexamcreator.com';
    const dbPath = process.env.SPKB_DB_PATH || 'spkb.db';

    console.log(`\n🤖 Starting Autonomous Quality Engine (AQE)...`);
    console.log(`🌐 Target URL: ${targetUrl}`);
    console.log(`🗄️  SPKB Database: ${dbPath}\n`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const orchestrator = new AutonomousOrchestrator({
            dbPath,
            targetUrl,
            maxDepth: 2,
            maxPages: 10
        });

        const result = await orchestrator.runCycle(page);
        console.log(`\n✅ Exploration Cycle Finished Successfully!`);
        console.log(`📄 Pages Explored: ${result.pagesExplored}`);
        console.log(`🧭 Unexplored Frontier Routes Remaining: ${result.frontierRemaining}`);
    } catch (error) {
        console.error('❌ Error executing AQE cycle:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main();
