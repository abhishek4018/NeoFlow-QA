import { chromium } from '@playwright/test';
import { loadCareConfig, CareConfig } from './config';
import { AutonomousOrchestrator } from '../cli/orchestrator';
import { SPKBDb } from '../spkb/db';
import { StateTracker, FlowMetadata } from './state-tracker';
import { StabilityGate } from './stability-gate';
import { PRPublisher } from './pr-publisher';

export interface DaemonOptions {
    configPath?: string;
    intervalMinutes?: number;
    once?: boolean;
}

export class CareDaemon {
    private options: DaemonOptions;
    private config: CareConfig;

    constructor(options: DaemonOptions = {}) {
        this.options = options;
        this.config = loadCareConfig(options.configPath);
    }

    public async executeSingleCycle(): Promise<void> {
        console.log(`\n🚀 [CARE Daemon] Starting autonomous exploration cycle for ${this.config.targetUrl}...`);
        const db = new SPKBDb('spkb.db');
        const stateTracker = new StateTracker(db);
        const stabilityGate = new StabilityGate();
        const prPublisher = new PRPublisher({
            dryRun: !this.config.git.autoPr,
            baseBranch: this.config.git.baseBranch,
            branchPrefix: this.config.git.branchPrefix
        });

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            const orchestrator = new AutonomousOrchestrator({
                targetUrl: this.config.targetUrl,
                maxDepth: this.config.depthLimit,
                maxPages: this.config.maxPages,
                maxAutoHealingAttempts: 3
            });

            const result = await orchestrator.runCycle(page);
            console.log(`✅ [CARE Daemon] Cycle finished. Pages explored: ${result.pagesExplored}`);
        } catch (err) {
            console.error('❌ [CARE Daemon] Cycle error:', err);
        } finally {
            await browser.close();
        }
    }

    public async start(): Promise<void> {
        if (this.options.once) {
            await this.executeSingleCycle();
            return;
        }

        const intervalMs = (this.options.intervalMinutes || 360) * 60 * 1000;
        console.log(`🕒 [CARE Daemon] Scheduled to run every ${this.options.intervalMinutes || 360} minutes.`);

        await this.executeSingleCycle();
        setInterval(async () => {
            await this.executeSingleCycle();
        }, intervalMs);
    }
}

if (require.main === module) {
    const isOnce = process.argv.includes('--once');
    const daemon = new CareDaemon({ once: isOnce });
    daemon.start();
}
