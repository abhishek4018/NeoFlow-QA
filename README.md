# NeoFlow-QA 🤖✨

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%5E18.12%20%7C%7C%20%5E20%20%7C%7C%20%5E22-brightgreen)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Serenity/JS](https://img.shields.io/badge/Serenity%2FJS-3.32.3-blueviolet)](https://serenity-js.org)

This repository provides an automated agentic BDD testing framework built on **Serenity/JS**, **Cucumber.js**, **Playwright**, and **TypeScript**, powered by the custom **`neo`** AI agent workflow.

### Installation

Once you have the code on your computer, run the following in the project directory:

```sh
npm ci
npx playwright install
```

[`npm ci`](https://docs.npmjs.com/cli/v6/commands/npm-ci) installs Node dependencies. [`npx playwright install`](https://playwright.dev/docs/cli#install-browsers) downloads browser binaries used by tests and codegen (required once per machine / after upgrading Playwright).

### Execution

The project provides several [NPM scripts](https://docs.npmjs.com/cli/v6/using-npm/scripts) defined in [`package.json`](package.json):

```
npm run lint            # runs code linter via ESLint
npm run lint:fix        # attempts to automatically fix linting issues
npm run clean           # removes reports from any previous test run
npm test                # executes the example test suite
                        # and generates the report under ./target/site/serenity
npm start               # starts a mini HTTP server and serves test reports
                        # at http://localhost:8080
npm run codegen         # Playwright codegen (CLI default: playwright-test style)
npm run codegen:library # record using the JavaScript library API; saves to generated/codegen/recording.ts
npm run codegen:library:preview   # same target as above, but UI only (no file written)
npm run codegen:playwright-test   # record with @playwright/test-style output
```

## Playwright Codegen & Raw Script Replays

[Playwright codegen](https://playwright.dev/docs/codegen) opens a browser and the inspector; actions you perform are recorded into code. Browsers must be installed (see **Installation** above).

### 1. Saving Output
Playwright writes a file when you pass `-o` / `--output`. The `codegen:library` script includes `-o generated/codegen/recording.ts`, so each recording updates that file on disk. Use `codegen:library:preview` when you only want the inspector and do not need a saved file.

**Examples:**

```sh
# Record against a URL; output goes to generated/codegen/recording.ts
npm run codegen:library -- https://happiesthealth.com/

# Another browser (chromium, firefox, webkit)
npm run codegen -- -b firefox --target javascript -o generated/codegen/recording.ts https://example.com/

# Full CLI (extra flags after --)
npm run codegen -- --help
```

### 2. Running Raw Playwright Test Specs
Raw test scripts are stored under [`codegen/`](codegen/) (e.g. `codegen/manual_authoring_raw.spec.ts`). You can execute and stabilize raw Playwright scripts using the dedicated configuration [`playwright.codegen.config.ts`](playwright.codegen.config.ts):

```sh
# Execute a raw Playwright script using the codegen config
npx playwright test -c playwright.codegen.config.ts codegen/manual_authoring_raw.spec.ts
```

Alternatively, run a standalone JS/TS recording file:

```sh
npx ts-node --transpile-only generated/codegen/recording.ts
```

---

## 🤖 Repository Agent & BDD Workflow (`neo`)

This repository defines a custom VS Code agent **`neo`** ([`.github/agents/neo.agent.md`](.github/agents/neo.agent.md)) and accompanying skills under `.github/skills/` to orchestrate end-to-end BDD script generation:

1. **Stage 1: Raw Playwright Generation & Replay (`playwright-script-generator`)**:
   - Create or record raw scripts under `codegen/<name>_raw.spec.ts`.
   - Replay and validate until execution succeeds (`npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts`).
2. **Stage 2: BDD Conversion (`serenity-script-generator`)**:
   - Convert validated raw scripts into Cucumber Gherkin feature files ([`features/codegen/<name>.feature`](features/codegen/)) and Serenity/JS step definitions ([`step-definitions/codegen/<name>.steps.ts`](step-definitions/codegen/)).

---

## Configuring Browser and Environment

You can control which browser and environment are used for your tests by setting environment variables when running your tests:

```
BROWSER=firefox ENVIRONMENT=prod npm test
```

This project also loads a `.env` file from the repository root automatically when [`support/serenity.config.ts`](support/serenity.config.ts) is initialized.

Use `.env` for local run defaults, or to store credentials and other environment-specific values without exporting them manually.

Example `.env` values:

```
USE_LAMBDATEST=false
BROWSER=chromium
ENVIRONMENT=qa

# LambdaTest credentials and capability overrides (optional)
# LT_USERNAME=YOUR_LAMBDATEST_USERNAME
# LT_ACCESS_KEY=YOUR_LAMBDATEST_ACCESS_KEY
# LT_BROWSER=chromium
# LT_BROWSER_VERSION=Latest
# LT_PLATFORM=Windows 11
# LT_BUILD=Serenity Cucumber Playwright Demo
# LT_TEST_NAME=Test
```

- `BROWSER` can be `chromium`, `firefox`, or `webkit` (defaults to `chromium` if not set).
- `ENVIRONMENT` can be `dev`, `qa`, or `prod` (defaults to `dev` if not set).
- The environment selects the base URL from `baseUrls` in [`support/serenity.config.ts`](support/serenity.config.ts). With the default map, `dev` and `qa` use an empty base URL; use **`ENVIRONMENT=prod`** (or set `baseUrls` for your env) for scenarios that rely on `Navigate.to('')` against Happiest Health.

---

## Running Specific Scripts with Cucumber Tags

You can use Cucumber tags to control which scenarios or features are executed. For example, to run only scenarios tagged with `@smoke`:

```
npx cucumber-js --tags "@smoke"
```

You can combine this with browser and environment configuration:

```
BROWSER=webkit ENVIRONMENT=prod npx cucumber-js --tags "@regression"
```

### Windows: environment variables and Cucumber (examples)

| Shell        | Command |
| ------------ | ------- |
| cmd.exe      | `set BROWSER=firefox && set ENVIRONMENT=dev && npx cucumber-js --profile default --tags "@MyTest"` |
| PowerShell   | `$env:BROWSER="firefox"; $env:ENVIRONMENT="dev"; npx cucumber-js --profile default --tags "@MyTest"` |

**cmd.exe** (run tests and Serenity BDD report):

```cmd
set BROWSER=firefox && set ENVIRONMENT=prod && npx cucumber-js --profile default --tags "@MyTest" && npx serenity-bdd run --features ./features
```

**PowerShell:**

```powershell
$env:BROWSER="firefox"; $env:ENVIRONMENT="prod"; npx cucumber-js --profile default --tags "@MyTest"; npx serenity-bdd run --features ./features
```

---

## Running Tests and Generating Serenity/JS Report

`npm test` runs **clean → all Cucumber scenarios → Serenity BDD report** (no tag filter). Set `BROWSER` / `ENVIRONMENT` the same way as above when you run it. With the default `baseUrls` in `serenity.config.ts`, use e.g. `ENVIRONMENT=prod npm test` for the bundled Happiest Health scenario (`Navigate.to('')` needs a non-empty base URL).

To run **only tagged** scenarios and then the report (equivalent pieces of `npm test`, but filtered):

### Mac/Linux (bash, zsh, etc.)
```sh
npm run clean; BROWSER=firefox ENVIRONMENT=prod npx cucumber-js --profile default --tags "@redbus-scenario"; npx serenity-bdd run --features ./features
```

### Windows Command Prompt (cmd.exe)
```cmd
npm run clean & set BROWSER=firefox & set ENVIRONMENT=prod & npx cucumber-js --profile default --tags "@redbus-scenario" & npx serenity-bdd run --features ./features
```

### Windows PowerShell
```powershell
npm run clean; $env:BROWSER="firefox"; $env:ENVIRONMENT="prod"; npx cucumber-js --profile default --tags "@HappiestHealthHome"; npx serenity-bdd run --features ./features
```

After running, open `target/site/serenity/index.html` in your browser to view the Serenity/JS report.