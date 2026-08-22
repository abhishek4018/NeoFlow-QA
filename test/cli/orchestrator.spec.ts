import { expect,test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { AutonomousOrchestrator } from '../../src/cli/orchestrator';

test.describe('Autonomous Quality Engine Orchestrator', () => {
    const testDbPath = path.join(__dirname, 'orchestrator_test_spkb.db');

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

    test('executes continuous exploration cycle on target url', async ({ page }) => {
        const orchestrator = new AutonomousOrchestrator({
            dbPath: testDbPath,
            targetUrl: 'https://quickexamcreator.com',
            maxDepth: 1,
            maxPages: 3
        });

        const cycleResult = await orchestrator.runCycle(page);
        expect(cycleResult.pagesExplored).toBeGreaterThan(0);
        expect(cycleResult.invariantsViolationsCount).toBe(0);
    });
});
