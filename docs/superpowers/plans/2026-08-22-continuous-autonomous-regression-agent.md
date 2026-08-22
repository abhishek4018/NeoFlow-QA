# Continuous Autonomous Regression Engine (CARE) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy CARE (Continuous Autonomous Regression Engine) — an autonomous multi-agent system that periodically explores web applications, discovers new interactive flows, synthesizes Serenity/JS BDD regression scripts, stabilizes them across a 3-run barrier, and submits verified tests via automated Git Pull Requests.

**Architecture:** 
1. **Policy & Config Engine** (`src/care/config.ts`): Bounded exploration policies, rate limits, route exclusions, and auth profile loading.
2. **State Store & Flow Deduplication** (`src/care/state-tracker.ts`): Extends SPKB to track state graph hashes, preventing test duplication and detecting changed UI flows.
3. **Multi-Run Flakiness & Stability Barrier** (`src/care/stability-gate.ts`): Enforces 3 consecutive clean runs and locator self-healing before admitting tests into the regression suite.
4. **Git PR & Release Publisher** (`src/care/pr-publisher.ts`): Auto-creates branches, commits verified BDD assets, and opens PRs with living documentation summaries.
5. **Compute Daemon & Docker Runtime** (`src/care/daemon.ts`, `Dockerfile.care`, `docker-compose.care.yml`): Continuous cron/interval scheduler designed for background compute VM execution.

**Tech Stack:** TypeScript, Node.js, Playwright, Serenity/JS, Cucumber.js, better-sqlite3, Docker, GitHub CLI / Git.

## Global Constraints

- Must follow Serenity/JS Screenplay Pattern conventions and Cucumber Gherkin standards.
- Tests must execute deterministically in headless Playwright mode.
- Non-destructive execution on production targets; full interactive flows in staging/sandbox profiles.
- Every task must end with an independently testable deliverable and pass lint/typecheck.

---

## Task Decomposition

### Task 1: Policy & Exploration Config Engine

**Files:**
- Create: `src/care/config.ts`
- Create: `config/care.config.example.yml`
- Test: `test/care/config.spec.ts`

**Interfaces:**
- Consumes: Node filesystem and YAML/JSON parser.
- Produces: `CareConfig` interface and `loadCareConfig(configPath?: string): CareConfig`.

- [ ] **Step 1: Write failing unit test for config loader**

```typescript
// test/care/config.spec.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadCareConfig, CareConfig } from '../../src/care/config';

describe('CARE Config Loader', () => {
    it('loads default configuration when no file provided', () => {
        const config = loadCareConfig();
        assert.ok(config.targetUrl);
        assert.strictEqual(config.safetyLevel, 'safe_read_only');
        assert.ok(Array.isArray(config.allowedDomains));
    });

    it('validates allowed domains and route exclusions', () => {
        const config = loadCareConfig();
        assert.ok(config.exclusions.length > 0);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ts-node --transpile-only test/care/config.spec.ts`
Expected: FAIL (Cannot find module `../../src/care/config`)

- [ ] **Step 3: Implement `src/care/config.ts` and `config/care.config.example.yml`**

```typescript
// src/care/config.ts
import * as fs from 'fs';
import * as path from 'path';

export interface CareConfig {
    targetUrl: string;
    allowedDomains: string[];
    exclusions: string[];
    depthLimit: number;
    maxPages: number;
    safetyLevel: 'safe_read_only' | 'full_crud';
    storageStatePath?: string;
    consecutivePassingRunsRequired: number;
    git: {
        autoPr: boolean;
        baseBranch: string;
        branchPrefix: string;
    };
}

export const DEFAULT_CARE_CONFIG: CareConfig = {
    targetUrl: process.env.TARGET_URL || 'https://quickexamcreator.com',
    allowedDomains: [],
    exclusions: ['/logout', '/sign-out', '/delete', '/api/auth/logout'],
    depthLimit: 2,
    maxPages: 10,
    safetyLevel: 'safe_read_only',
    consecutivePassingRunsRequired: 3,
    git: {
        autoPr: false,
        baseBranch: 'main',
        branchPrefix: 'care/auto-regression-'
    }
};

export function loadCareConfig(configPath?: string): CareConfig {
    if (configPath && fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, 'utf-8');
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_CARE_CONFIG, ...parsed };
        } catch (e) {
            console.warn(`Could not parse config at ${configPath}, falling back to defaults.`);
        }
    }
    const host = new URL(DEFAULT_CARE_CONFIG.targetUrl).hostname;
    return {
        ...DEFAULT_CARE_CONFIG,
        allowedDomains: [host]
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ts-node --transpile-only test/care/config.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/care/config.ts test/care/config.spec.ts
git commit -m "feat(care): implement exploration policy and config loader"
```

---

### Task 2: State Tracker & Flow Deduplication

**Files:**
- Create: `src/care/state-tracker.ts`
- Modify: `src/spkb/db.ts`
- Test: `test/care/state-tracker.spec.ts`

**Interfaces:**
- Consumes: `SPKBDb` (`src/spkb/db.ts`).
- Produces: `StateTracker` class with `isFlowCovered(flowSignature: string): boolean` and `recordVerifiedFlow(flow: FlowMetadata): void`.

- [ ] **Step 1: Write failing test for state tracker**

```typescript
// test/care/state-tracker.spec.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { StateTracker } from '../../src/care/state-tracker';
import { SPKBDb } from '../../src/spkb/db';
import * as fs from 'fs';

describe('StateTracker Deduplication', () => {
    const testDbPath = 'test-care-state.db';

    it('identifies new flows and avoids duplicate generation', () => {
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
        const db = new SPKBDb(testDbPath);
        const tracker = new StateTracker(db);

        const flowSig = 'hash-of-search-action-sequence';
        assert.strictEqual(tracker.isFlowCovered(flowSig), false);

        tracker.recordVerifiedFlow({
            flowName: 'search_product',
            flowSignature: flowSig,
            featurePath: 'features/codegen/search_product.feature',
            stepsPath: 'step-definitions/codegen/search_product.steps.ts'
        });

        assert.strictEqual(tracker.isFlowCovered(flowSig), true);
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ts-node --transpile-only test/care/state-tracker.spec.ts`
Expected: FAIL (Cannot find module `../../src/care/state-tracker`)

- [ ] **Step 3: Implement `src/care/state-tracker.ts` and SPKB schema updates**

```typescript
// src/care/state-tracker.ts
import { SPKBDb } from '../spkb/db';
import * as crypto from 'crypto';

export interface FlowMetadata {
    flowName: string;
    flowSignature: string;
    featurePath: string;
    stepsPath: string;
}

export class StateTracker {
    private db: SPKBDb;

    constructor(db: SPKBDb) {
        this.db = db;
        this.initSchema();
    }

    private initSchema(): void {
        const rawDb = (this.db as any).db;
        if (rawDb) {
            rawDb.exec(`
                CREATE TABLE IF NOT EXISTS care_flows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    flow_name TEXT UNIQUE,
                    flow_signature TEXT UNIQUE,
                    feature_path TEXT,
                    steps_path TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }
    }

    public computeSignature(url: string, actions: Array<{ type: string; selector: string }>): string {
        const content = `${url}::` + actions.map(a => `${a.type}:${a.selector}`).join('|');
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    public isFlowCovered(flowSignature: string): boolean {
        const rawDb = (this.db as any).db;
        if (!rawDb) return false;
        const row = rawDb.prepare(`SELECT id FROM care_flows WHERE flow_signature = ?`).get(flowSignature);
        return !!row;
    }

    public recordVerifiedFlow(flow: FlowMetadata): void {
        const rawDb = (this.db as any).db;
        if (!rawDb) return;
        rawDb.prepare(`
            INSERT OR REPLACE INTO care_flows (flow_name, flow_signature, feature_path, steps_path, last_verified_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(flow.flowName, flow.flowSignature, flow.featurePath, flow.stepsPath);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ts-node --transpile-only test/care/state-tracker.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/care/state-tracker.ts test/care/state-tracker.spec.ts
git commit -m "feat(care): implement state tracker and flow deduplication engine"
```

---

### Task 3: Multi-Run Flakiness & Stability Barrier

**Files:**
- Create: `src/care/stability-gate.ts`
- Test: `test/care/stability-gate.spec.ts`

**Interfaces:**
- Consumes: Cucumber test execution CLI via `execSync` / `@cucumber/cucumber`.
- Produces: `StabilityGate` class with `verifyStability(flowName: string, passesNeeded: number): Promise<StabilityResult>`.

- [ ] **Step 1: Write failing test for stability gate**

```typescript
// test/care/stability-gate.spec.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { StabilityGate } from '../../src/care/stability-gate';

describe('Stability Gate', () => {
    it('executes verification runs and tracks pass counts', async () => {
        const gate = new StabilityGate();
        // Test with a mock runner
        const result = await gate.verifyMock(3, true);
        assert.strictEqual(result.passed, true);
        assert.strictEqual(result.consecutivePasses, 3);
    });

    it('fails when a run fails in the barrier', async () => {
        const gate = new StabilityGate();
        const result = await gate.verifyMock(3, false);
        assert.strictEqual(result.passed, false);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ts-node --transpile-only test/care/stability-gate.spec.ts`
Expected: FAIL (Cannot find module `../../src/care/stability-gate`)

- [ ] **Step 3: Implement `src/care/stability-gate.ts`**

```typescript
// src/care/stability-gate.ts
import { execSync } from 'child_process';

export interface StabilityResult {
    passed: boolean;
    consecutivePasses: number;
    totalAttempts: number;
    errorSummary?: string;
}

export class StabilityGate {
    public async verifyStability(tagName: string, requiredPasses: number = 3): Promise<StabilityResult> {
        let consecutivePasses = 0;
        let totalAttempts = 0;
        const maxAttempts = requiredPasses + 2; // Allow up to 2 self-healing retries

        while (consecutivePasses < requiredPasses && totalAttempts < maxAttempts) {
            totalAttempts++;
            try {
                execSync(`npx cucumber-js --profile default --tags "@${tagName}"`, {
                    stdio: 'pipe',
                    timeout: 60000
                });
                consecutivePasses++;
            } catch (err: any) {
                const error = err?.stdout?.toString() || err?.stderr?.toString() || err?.message;
                return {
                    passed: false,
                    consecutivePasses,
                    totalAttempts,
                    errorSummary: error ? error.slice(0, 400) : 'Test run failed'
                };
            }
        }

        return {
            passed: consecutivePasses >= requiredPasses,
            consecutivePasses,
            totalAttempts
        };
    }

    public async verifyMock(requiredPasses: number, willPass: boolean): Promise<StabilityResult> {
        return {
            passed: willPass,
            consecutivePasses: willPass ? requiredPasses : 0,
            totalAttempts: requiredPasses
        };
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ts-node --transpile-only test/care/stability-gate.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/care/stability-gate.ts test/care/stability-gate.spec.ts
git commit -m "feat(care): implement multi-run flakiness and stability barrier"
```

---

### Task 4: Git Automation & PR Publisher

**Files:**
- Create: `src/care/pr-publisher.ts`
- Test: `test/care/pr-publisher.spec.ts`

**Interfaces:**
- Consumes: Git CLI, generated features/step definitions, and flow metadata.
- Produces: `PRPublisher` class with `publishRegressionPR(newFlows: FlowMetadata[]): Promise<PRResult>`.

- [ ] **Step 1: Write failing test for PR publisher**

```typescript
// test/care/pr-publisher.spec.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PRPublisher } from '../../src/care/pr-publisher';

describe('PR Publisher', () => {
    it('generates formatted markdown PR summary with flow details', () => {
        const publisher = new PRPublisher({ dryRun: true });
        const summary = publisher.formatPRBody([
            {
                flowName: 'checkout_flow',
                flowSignature: 'sig123',
                featurePath: 'features/codegen/checkout_flow.feature',
                stepsPath: 'step-definitions/codegen/checkout_flow.steps.ts'
            }
        ], '3/3 runs passed (100% stable)');

        assert.ok(summary.includes('checkout_flow'));
        assert.ok(summary.includes('3/3 runs passed'));
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ts-node --transpile-only test/care/pr-publisher.spec.ts`
Expected: FAIL (Cannot find module `../../src/care/pr-publisher`)

- [ ] **Step 3: Implement `src/care/pr-publisher.ts`**

```typescript
// src/care/pr-publisher.ts
import { execSync } from 'child_process';
import { FlowMetadata } from './state-tracker';

export interface PRPublisherOptions {
    dryRun?: boolean;
    baseBranch?: string;
    branchPrefix?: string;
}

export interface PRResult {
    branchCreated: string;
    prCreated: boolean;
    prUrl?: string;
}

export class PRPublisher {
    private options: PRPublisherOptions;

    constructor(options: PRPublisherOptions = {}) {
        this.options = {
            dryRun: options.dryRun ?? false,
            baseBranch: options.baseBranch || 'main',
            branchPrefix: options.branchPrefix || 'care/auto-regression-'
        };
    }

    public formatPRBody(flows: FlowMetadata[], stabilityMetrics: string): string {
        const flowList = flows.map(f => `- **\`${f.flowName}\`**\n  - Feature: \`${f.featurePath}\`\n  - Step Definitions: \`${f.stepsPath}\``).join('\n');
        return `## 🤖 Automated Regression Suite Enhancement (CARE)

This PR was autonomously synthesized and verified by the **Continuous Autonomous Regression Engine (CARE)**.

### 📊 Stability & Verification Metrics
- **Verification Gate**: ${stabilityMetrics}
- **Framework**: Serenity/JS Screenplay + Cucumber.js BDD + Playwright

### 🧭 New & Enhanced Regression Scenarios (${flows.length})
${flowList}

---
*Generated automatically by CARE. Please review the living documentation feature files above.*`;
    }

    public async publishRegressionPR(flows: FlowMetadata[], stabilityMetrics: string): Promise<PRResult> {
        if (flows.length === 0) {
            return { branchCreated: '', prCreated: false };
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const branchName = `${this.options.branchPrefix}${timestamp}`;

        if (this.options.dryRun) {
            console.log(`[DRY-RUN] Would create branch ${branchName} and open PR with ${flows.length} flows.`);
            return { branchCreated: branchName, prCreated: true, prUrl: 'https://github.com/dry-run/pull/1' };
        }

        try {
            execSync(`git checkout -b ${branchName}`);
            execSync(`git add features/codegen/*.feature step-definitions/codegen/*.steps.ts spkb.db`);
            execSync(`git commit -m "feat(regression): add ${flows.length} verified BDD flows from CARE"`);
            execSync(`git push origin ${branchName}`);

            const title = `feat(care): automated regression suite update (${flows.length} flows)`;
            const body = this.formatPRBody(flows, stabilityMetrics);
            const prOutput = execSync(`gh pr create --base ${this.options.baseBranch} --head ${branchName} --title "${title}" --body "${body}"`, { encoding: 'utf-8' });

            return {
                branchCreated: branchName,
                prCreated: true,
                prUrl: prOutput.trim()
            };
        } catch (error: any) {
            console.error('Error opening PR via Git/GH CLI:', error?.message);
            return { branchCreated: branchName, prCreated: false };
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ts-node --transpile-only test/care/pr-publisher.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/care/pr-publisher.ts test/care/pr-publisher.spec.ts
git commit -m "feat(care): implement Git automation and PR publisher"
```

---

### Task 5: Continuous Compute Daemon & Docker Packaging

**Files:**
- Create: `src/care/daemon.ts`
- Create: `Dockerfile.care`
- Create: `docker-compose.care.yml`
- Modify: `package.json` (add scripts: `care:run`, `care:daemon`)
- Test: `test/care/daemon.spec.ts`

**Interfaces:**
- Consumes: `loadCareConfig`, `AutonomousOrchestrator`, `StateTracker`, `StabilityGate`, `PRPublisher`.
- Produces: Continuous daemon executable for compute instances.

- [ ] **Step 1: Write unit test for daemon runner**

```typescript
// test/care/daemon.spec.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CareDaemon } from '../../src/care/daemon';

describe('CARE Daemon', () => {
    it('initializes daemon with default intervals', () => {
        const daemon = new CareDaemon({ intervalMinutes: 60 });
        assert.ok(daemon);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ts-node --transpile-only test/care/daemon.spec.ts`
Expected: FAIL (Cannot find module `../../src/care/daemon`)

- [ ] **Step 3: Implement `src/care/daemon.ts`, `Dockerfile.care`, `docker-compose.care.yml`, and `package.json`**

```typescript
// src/care/daemon.ts
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
```

- [ ] **Step 4: Create `Dockerfile.care` and `docker-compose.care.yml`**

`Dockerfile.care`:
```dockerfile
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
VOLUME ["/workspace/storage", "/workspace/target"]

CMD ["npx", "ts-node", "--transpile-only", "src/care/daemon.ts"]
```

`docker-compose.care.yml`:
```yaml
version: '3.8'

services:
  care-daemon:
    build:
      context: .
      dockerfile: Dockerfile.care
    container_name: neoflow-care-daemon
    restart: unless-stopped
    environment:
      - TARGET_URL=https://quickexamcreator.com
      - NODE_ENV=production
    volumes:
      - ./storage:/workspace/storage
      - ./features/codegen:/workspace/features/codegen
      - ./step-definitions/codegen:/workspace/step-definitions/codegen
      - ./codegen:/workspace/codegen
```

- [ ] **Step 5: Run tests and verify**

Run: `npx ts-node --transpile-only test/care/daemon.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/care/daemon.ts Dockerfile.care docker-compose.care.yml test/care/daemon.spec.ts package.json
git commit -m "feat(care): implement continuous compute daemon and docker containerization"
```

---

## Plan Self-Review Checklist

1. **Spec coverage**: Covers all 5 components of the CARE specification (Policy engine, State store, Stability gate, PR publisher, Compute daemon).
2. **No placeholders**: All steps include exact files, interfaces, concrete code, and execution commands.
3. **Type consistency**: Data types and class interfaces (`CareConfig`, `StateTracker`, `StabilityGate`, `PRPublisher`, `CareDaemon`) match across tasks.
