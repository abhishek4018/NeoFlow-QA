name: playwright-script-generator
description: "Use when: generating raw Playwright scripts, creating codegen tests, replaying scripts with playwright.codegen.config.ts, capturing stable selectors with Playwright MCP tools, stabilizing flaky raw scripts, preparing codegen/`<name>`_raw.spec.ts files before BDD conversion, validating raw script pass criteria, and troubleshooting failing raw Playwright runs in this SerenityJS repository."

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

## Required Inputs

- Scenario name.
- Target URL.
- Preferred raw script file name.
- Optional browser/environment context.
- Pass criteria (what success looks like).

## File Rules

- Raw script path must be `codegen/<name>_raw.spec.ts`.
- Do not silently overwrite existing files.
- If a target file exists, ask to append, update specific blocks, or create a new suffix file.

## Workflow

1. Capture realistic selectors from live page state when possible.
2. Scaffold raw script using `@playwright/test` conventions.
3. Replay with:
   - `npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts`
4. If failing, stabilize selectors/assertions and rerun.
5. Stop only when replay passes or the user explicitly accepts unresolved issues.

## Guardrails

- Always use `playwright.codegen.config.ts` for replay.
- Never use `playwright.generated.config.ts` for raw codegen replay.
- Keep raw scripts independent from Serenity actor APIs.
- Prefer stable selectors (`role`, `label`, `test-id`) over brittle locators.

## Completion Criteria

- Raw script exists at the expected codegen path.
- Replay command has been run and outcome is reported.
- If pass: include a clear handoff note that BDD conversion can proceed via `serenity-script-generator`.
- If fail: include exact blocker summary and next stabilization action.

## Example Invocations

- Generate a raw Playwright script for checkout flow.
- Create `codegen/dolo360_raw.spec.ts` and stabilize until pass.
- Replay and fix flaky selector issues in `codegen/dolo360_raw`.spec.ts.
