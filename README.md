# Serenity/JS Cucumber Playwright Template


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
npm run lint            # runs code linter
npm run lint:fix        # attempts to automatically fix linting issues
npm run clean           # removes reports from any previous test run
npm test                # executes the example test suite
                        # and generates the report under ./target/site/serenity
npm start               # starts a mini HTTP server and serves the test reports
                        # at http://localhost:8080
npm run codegen         # Playwright codegen (CLI default: playwright-test style)
npm run codegen:library # record using the JavaScript library API; saves to generated/codegen/recording.ts
npm run codegen:library:preview   # same target as above, but UI only (no file written)
npm run codegen:playwright-test   # record with @playwright/test-style output
```

## Playwright Codegen (record and generate scripts)

[Playwright codegen](https://playwright.dev/docs/codegen) opens a browser and the inspector; actions you perform are turned into code. Browsers must be installed (see **Installation** above).

**Saving output:** Playwright writes a file only when you pass `-o` / `--output`. The `codegen:library` script includes `-o generated/codegen/recording.ts`, so each recording updates that file on disk. Use `codegen:library:preview` when you only want the inspector and do not need a saved file.

**Examples:**

```sh
# Record against a URL; output goes to generated/codegen/recording.ts
npm run codegen:library -- https://happiesthealth.com/

# Another browser (chromium, firefox, webkit)
npm run codegen -- -b firefox --target javascript -o generated/codegen/recording.ts https://example.com/

# Full CLI (extra flags after --)
npm run codegen -- --help
```

**Run a saved recording** (standalone Playwright script; not part of `npm test` / Cucumber):

```sh
npx ts-node --transpile-only generated/codegen/recording.ts
```

Swap the path for another file (e.g. `generated/codegen/recording1.ts`) if you recorded to a different name. Requires `npx playwright install` so browsers are available.

**Cursor / VS Code:** **Terminal → Run Task…** (or **Tasks: Run Task**) and choose one of:

- **Playwright: Codegen (record, default output)** — CLI default target (`playwright-test` style)
- **Playwright: Codegen (library → saves generated/codegen/recording.ts)** — JavaScript library API and writes `recording.ts`
- **Playwright: Codegen (library, preview only — no file)** — same as above without `-o`

**Serenity/JS note:** this project runs **Cucumber** scenarios, not `@playwright/test` specs. Treat generated code as a draft and map it into your feature files and step definitions under `features/` and `step-definitions/`.

Recordings under `generated/codegen/*.ts` are ignored by git (see `.gitignore`); the `generated/codegen/` folder is kept in the repo via `.gitkeep`.

## Configuring Browser and Environment

You can control which browser and environment are used for your tests by setting environment variables when running your tests:

```
BROWSER=firefox ENVIRONMENT=prod npm test
```

This project also loads a `.env` file from the repository root automatically when `support/serenity.config.ts` is initialized.

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