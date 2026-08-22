import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

import { AutonomousOrchestrator } from '../cli/orchestrator';
import { SPKBDb } from '../spkb/db';
import { CareConfig, loadCareConfig } from './config';
import { PRPublisher } from './pr-publisher';
import { StabilityGate } from './stability-gate';
import { StateTracker } from './state-tracker';

export interface DaemonOptions {
    configPath?: string;
    intervalMinutes?: number;
    once?: boolean;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CareDaemon {
    private options: DaemonOptions;
    private config: CareConfig;
    private running: boolean = false;

    constructor(options: DaemonOptions = {}) {
        this.options = options;
        this.config = loadCareConfig(options.configPath);
    }

    public async executeSingleCycle(): Promise<void> {
        console.log(`\n🚀 [CARE Daemon] Starting autonomous exploration cycle for ${this.config.targetUrl}...`);
        const _db = new SPKBDb('spkb.db');
        const _stateTracker = new StateTracker(_db);
        const _stabilityGate = new StabilityGate();
        const _prPublisher = new PRPublisher({
            dryRun: !this.config.git.autoPr,
            baseBranch: this.config.git.baseBranch,
            branchPrefix: this.config.git.branchPrefix
        });

        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
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

    private startReportServer(port: number = 8080): void {
        const reportDir = path.resolve(process.cwd(), 'target/site/serenity');

        const mimeTypes: Record<string, string> = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf'
        };

        const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            let reqUrl = (req.url || '/').split('?')[0];
            if (reqUrl === '/' || reqUrl.endsWith('/')) {
                reqUrl += 'index.html';
            }
            const safePath = path.normalize(reqUrl).replace(/^(\.\.[/\\])+/, '');
            const filePath = path.join(reportDir, safePath);

            if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
                    <h2>🤖 NeoFlow CARE Daemon Report Server</h2>
                    <p>Serenity living documentation is being generated...</p>
                </body></html>`);
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
        });

        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`ℹ️ [CARE Daemon] Port ${port} is already in use (e.g. by Docker). Skipping embedded report server.`);
            } else {
                console.warn(`⚠️ [CARE Daemon] Report server notice:`, err.message);
            }
        });

        try {
            server.listen(port, '0.0.0.0', () => {
                console.log(`📊 [CARE Daemon] Live Serenity BDD Report Server running at http://0.0.0.0:${port}`);
            });
        } catch (_e) {
            // ignore synchronous listen errors
        }
    }

    public async start(): Promise<void> {
        if (this.options.once) {
            await this.executeSingleCycle();
            return;
        }

        this.startReportServer(Number(process.env.REPORT_PORT) || 8080);

        const intervalMs = (this.options.intervalMinutes || 360) * 60 * 1000;
        console.log(`🕒 [CARE Daemon] Scheduled to run every ${this.options.intervalMinutes || 360} minutes.`);

        this.running = true;
        while (this.running) {
            await this.executeSingleCycle();
            await sleep(intervalMs);
        }
    }

    public stop(): void {
        this.running = false;
        console.log(`🛑 [CARE Daemon] Stopping...`);
    }
}

if (require.main === module) {
    const isOnce = process.argv.includes('--once');
    const daemon = new CareDaemon({ once: isOnce });
    daemon.start();
}
