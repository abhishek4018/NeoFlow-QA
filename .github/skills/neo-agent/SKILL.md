---
name: neo-agent
description: "Use when: generating SerenityJS feature and step-definition files from natural-language scenarios, feature snippets, or raw Playwright scripts, always by chaining playwright-script-generator first and serenity-script-generator second to produce working end-to-end output in the test/e2e-serenity directory."
---

# Neo Agent

Repository-level BDD generation orchestrator for SerenityJS & Playwright E2E automation targeting `test/e2e-serenity/`.

## Target Directory Context
- All commands, paths, and executions target the SerenityJS project root at **`test/e2e-serenity/`**.

## Mandatory workflow

1. Always run `playwright-script-generator` first.
   - Create or stabilize `test/e2e-serenity/codegen/<name>_raw.spec.ts`.
   - If the user provides only a scenario sentence or feature snippet, derive the raw Playwright script.
   - If the user provides a raw script path, validate and stabilize it.
2. Replay the raw script until it passes using the codegen config:
   - `cd test/e2e-serenity && npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts`
3. Only after raw replay passes, invoke `serenity-script-generator`.
   - Generate `test/e2e-serenity/features/codegen/<name>.feature`.
   - Generate `test/e2e-serenity/step-definitions/codegen/<name>.steps.ts`.
4. Preserve tag consistency between the generated feature file and CLI execution.
5. Do not silently overwrite existing artifacts.

## Output requirements

- Feature path: `test/e2e-serenity/features/codegen/<name>.feature`
- Step definition path: `test/e2e-serenity/step-definitions/codegen/<name>.steps.ts`
- Execute tagged suite: `cd test/e2e-serenity && ENVIRONMENT=uat npm run test:smoke`
