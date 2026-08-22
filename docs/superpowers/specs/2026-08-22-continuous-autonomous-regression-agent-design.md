# NeoFlow Continuous Autonomous Regression Engine (CARE) — Design Specification

## 1. Executive Summary & Vision

NeoFlow-QA currently provides a BDD test automation foundation using **Serenity/JS**, **Cucumber.js**, and **Playwright**, with an AI agent (`neo`) for synthesizing BDD assets from raw scripts.

This specification designs **CARE (Continuous Autonomous Regression Engine)**: an autonomous, distributed multi-agent system deployed to a compute instance (e.g. VM or Docker container). CARE periodically crawls a target web application, discovers new workflows and UI state transitions, synthesizes robust Playwright + Serenity/JS BDD regression test scripts, stabilizes them across a multi-run green barrier, and submits verified tests via automated Git Pull Requests.

---

## 2. Core Architectural Principles & Scope

1. **Config-Driven Exploration Policy**: Bounded by declarative domain rules, path inclusion/exclusion patterns, depth limits, and safety tiers to prevent unintended or destructive mutations.
2. **Deterministic BDD Synthesis**: Generated tests strictly follow Serenity/JS Screenplay Pattern and Cucumber Gherkin standards, preserving human-readable living documentation.
3. **Flakiness & Stability Gate**: No test enters a Pull Request without passing 3 consecutive headless verification runs and locator self-healing.
4. **Stateful Knowledge Persistence**: Discovered routes, interactive DOM snapshots, and test metadata are persisted in a local state store to prevent duplicate test generation and track site evolution.
5. **Human-in-the-Loop Governance via PRs**: All new tests and self-healed updates are submitted via Git Pull Requests with detailed impact summaries and Serenity reports.

---

## 3. System Architecture & Component Breakdown

```mermaid
flowchart TD
    subgraph Compute_Daemon [Compute Instance / Docker Daemon]
        Scheduler[Cron / Periodic Scheduler] --> DaemonController[Daemon Orchestrator Controller]
        StateStore[(State Store: SQLite / JSON Graph)] <--> DaemonController

        subgraph Multi_Agent_Pipeline [Multi-Agent Subagent Pipeline]
            ExplorerAgent[1. Site Explorer Agent]
            DiffAnalyzer[2. Flow Diff & Deduplication Agent]
            ScriptGenerator[3. BDD Script Generator (Neo Engine)]
            StabilizerAgent[4. Stabilizer & Self-Healing Agent]
            PRBot[5. Git PR & Release Publisher]
        end

        DaemonController --> ExplorerAgent
        ExplorerAgent --> DiffAnalyzer
        DiffAnalyzer --> ScriptGenerator
        ScriptGenerator --> StabilizerAgent
        StabilizerAgent --> PRBot
    end

    TargetApp[Target Web Application] <--- ExplorerAgent & StabilizerAgent
    GitHost[Git Repository / GitHub / GitLab] <--- PRBot
```

### Component Details

### 3.1 Policy & Exploration Configuration (`config/care.config.yml`)
- `target_url`: Base URL of the application.
- `allowed_domains`: Whitelist of valid domain origins.
- `exclusions`: Regex patterns for endpoints to avoid (e.g. `/logout`, `/delete.*`, `/stripe.*`).
- `auth`: Credentials / storage state files for pre-authenticated session restoration.
- `depth_limit`: Max link/state transition depth (default: 3).
- `safety_level`: `safe_read_only` (production safe) or `full_crud` (staging/sandbox).

### 3.2 State Store & Site Graph (`storage/care-state.db`)
- SQLite database storing:
  - `pages`: Discovered routes, URL patterns, page titles, and DOM semantic signatures.
  - `flows`: Distinct interaction sequences (e.g., Search -> Filter -> Add to Cart).
  - `test_mappings`: Mapping between flows, generated feature files (`features/codegen/*.feature`), and step definitions (`step-definitions/codegen/*.steps.ts`).
  - `run_history`: Run timestamps, success rates, flakiness metrics, and PR tracking.

### 3.3 Subagent Pipeline
1. **Site Explorer Agent**:
   - Uses Playwright headless browser to crawl allowed URLs.
   - Discovers interactive elements (`button`, `input`, `select`, `a`, ARIA roles).
   - Generates interaction traces (`storage/traces/*.json`).
2. **Flow Diff & Deduplication Agent**:
   - Compares current exploration traces against `care-state.db`.
   - Flags:
     - **New Flows**: Uncovered journeys ready for test synthesis.
     - **Modified Flows**: Existing flows whose DOM selectors or routes have changed (self-heal candidates).
     - **Unchanged Flows**: Skipped to avoid duplicate test creation.
3. **BDD Script Generator (Neo Engine Integration)**:
   - Converts trace actions into raw Playwright scripts (`codegen/<flow>_raw.spec.ts`).
   - Converts stabilized raw scripts into Serenity/JS feature files (`features/codegen/<flow>.feature`) and step definitions (`step-definitions/codegen/<flow>.steps.ts`).
4. **Stabilizer & Self-Healing Agent**:
   - Runs test execution 3 consecutive times: `npx cucumber-js --tags "@<Tag>"`.
   - On locator failure, analyzes current DOM snapshot, updates step definitions with resilient semantic locators (e.g. `role`, `accessible-name`), and re-verifies.
5. **Git PR & Release Publisher**:
   - Creates a dedicated branch `care/auto-regression-<timestamp>`.
   - Commits generated feature files, step definitions, and state db updates.
   - Pushes branch and opens a Pull Request using GitHub API / CLI (`gh pr create`).
   - Formats PR description with scenario lists, Serenity report summary, and execution metrics.

---

## 4. Compute Instance Deployment Model

### 4.1 Dockerized Daemon
- Base image: `mcr.microsoft.com/playwright:v1.45.0-jammy` or compatible Node 20 environment.
- Pre-installed dependencies: Node.js, Playwright browsers, Serenity-BDD CLI, GitHub CLI (`gh`).
- Volume mounts: `/workspace/storage` for persistent state DB and execution logs.

### 4.2 Periodic Execution Scheduling
- Executed via background cron process inside the container or host VM scheduler:
  ```cron
  0 */6 * * * cd /workspace && npm run care:run >> /workspace/storage/daemon.log 2>&1
  ```

---

## 5. Phased Implementation Roadmap

### Phase 1: Core Exploration & Synthesis Engine (Local CLI)
- Implement `config/care.config.yml` parser and validator.
- Build `scripts/care/explorer.ts` using Playwright to crawl and record structured trace events.
- Connect explorer output to `neo` script generator to produce `.feature` and `.steps.ts` files automatically from a single CLI command: `npm run care:explore -- https://example.com`.

### Phase 2: State Store, Deduplication & Self-Healing Stabilizer
- Implement SQLite state store (`scripts/care/state-db.ts`) for flow hashing and page graph tracking.
- Build multi-run stabilization harness (`scripts/care/stabilizer.ts`) running 3x pass verification.
- Implement locator self-healing mechanism when step definitions fail execution.

### Phase 3: Compute Daemon, Docker Packaging & Automated PR Bot
- Create `Dockerfile.care` and `docker-compose.care.yml` for isolated containerized runs.
- Build Git automation bot (`scripts/care/pr-publisher.ts`) to branch, commit, push, and create PRs.
- Implement daemon runner with cron scheduler and health check telemetry.

---

## 6. Success Metrics & Verification

- **Exploration Completeness**: Discovers >= 90% of reachable routes defined in exploration scope.
- **Test Pass Rate**: 100% pass rate on generated tests prior to PR submission (verified by 3-run gate).
- **No Duplicate Tests**: State store prevents regenerating scenarios already covered in existing `.feature` files.
- **Zero-Manual-Touch Execution**: Daemon runs autonomously on compute instance without human intervention until PR review.
