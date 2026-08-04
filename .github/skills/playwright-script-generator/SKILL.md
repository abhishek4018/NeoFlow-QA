---
name: playwright-script-generator
description: "Use when: generating raw Playwright scripts, creating codegen tests, replaying scripts with playwright.codegen.config.ts in test/e2e-serenity, capturing stable selectors with Playwright MCP tools, stabilizing flaky raw scripts, preparing test/e2e-serenity/codegen/<name>_raw.spec.ts files before BDD conversion, validating raw script pass criteria, and troubleshooting failing raw Playwright runs in this SerenityJS repository."
---

# Playwright Script Generator

Generate and stabilize raw Playwright scripts targeting **`test/e2e-serenity/`**.

## Working Directory
- Working Directory: **`test/e2e-serenity/`**

## Scope
- Capture or verify selectors using Playwright MCP browser tools.
- Create or update raw scripts in `test/e2e-serenity/codegen/<name>_raw.spec.ts`.
- Replay raw scripts with:
  `cd test/e2e-serenity && npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts`
- Iterate until the raw script is stable and passing.
