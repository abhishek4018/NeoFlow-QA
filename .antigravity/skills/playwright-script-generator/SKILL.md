---
name: playwright-script-generator
description: "Use when: generating raw Playwright scripts, creating codegen tests, replaying scripts with playwright.codegen.config.ts, capturing stable selectors with Playwright MCP tools, stabilizing flaky raw scripts, preparing codegen/<name>_raw.spec.ts files before BDD conversion, validating raw script pass criteria, and troubleshooting failing raw Playwright runs in this SerenityJS repository."
---

# Playwright Script Generator

Generate and stabilize raw Playwright scripts for this repository.

## Scope

This skill is only for raw Playwright script generation and stabilization.

Do:
- Capture or verify selectors using Playwright MCP browser tools.
- Create or update raw scripts in `codegen/<name>_raw.spec.ts`.
- Replay raw scripts with `playwright.codegen.config.ts`.
- Iterate until the raw script is stable and passing.

Do not:
- Generate feature files.
- Generate Serenity step definitions.
- Run raw-to-BDD conversion.

## Workflow
1. Capture realistic selectors from live page state when possible.
2. Scaffold raw script using `@playwright/test` conventions.
3. Replay with: `npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts`
4. If failing, stabilize selectors/assertions and rerun.
5. Stop only when replay passes or the user explicitly accepts unresolved issues.
