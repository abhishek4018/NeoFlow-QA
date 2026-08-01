name: serenity-script-generator
description: "Use when: generating SerenityJS BDD assets, creating feature files and step definitions directly from a passing raw Playwright script, intelligently extracting locators and actions, applying duplicate-step detection and common-pattern analysis, validating best-practice patterns, scaffolding features/codegen and features/step-definitions/codegen outputs, applying Cucumber tag conventions, and executing cucumber-js plus serenity-bdd reporting flow in this repository."

# Serenity Script Generator

Generate Serenity-compatible feature and step-definition artifacts from validated raw scripts.

## Scope

This skill is only for BDD artifact generation and Serenity execution flow.

Do:
- Convert a passing raw script to feature and step files using direct intelligent generation.
- Ensure output paths and naming follow project conventions.
- Run Cucumber + Serenity report pipeline when requested.

Do not:
- Author or stabilize raw Playwright scripts from scratch.
- Proceed with conversion if raw replay has not passed.
- Depend on `src/playwrightToBDD.ts` as the generation path for this skill.
- If raw script is missing or failing, route back to `playwright-script-generator` first.

## Prerequisite Gate
- Before conversion, confirm raw replay passed via:
  - `npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts`
- Or the user explicitly confirms equivalent successful raw execution.
- If this gate is not met, stop conversion and request raw stabilization first.

## Required Inputs
- Passing raw script path in `codegen/`.
- Feature title.
- Tag name (for example `@LoginFlow`).
- Generation mode (`auto` by default, `interactive` when selector capture assistance is needed).

## Generation Method (Direct Intelligence)

Generate files directly from the validated raw script. Do not call the converter CLI.

Required capability parity with the converter:
1. Parse raw Playwright actions and assertions (`goto`, `click`, `fill`, `select`, `hover`, `wait`, `expect`, `check`, `uncheck`, `press`).
2. Build readable Gherkin steps from parsed actions while preserving user intent.
3. Generate Serenity step definitions with embedded locator mapping.
4. Scan existing `features/step-definitions/**/*.steps.ts` for duplicate expressions and skip or reuse safely.
5. Detect reusable/common patterns and prefer shared behavior in `features/step-definitions/generic/common.steps.ts`.
6. Validate best-practice patterns and flag issues such as retry-loop, modal-handling, dynamic-data, locator-hardcoding, error-recovery, and parameterization.
7. Emit remediation hints and safer alternatives when risks are found.
8. Preserve step granularity by default.
9. Apply generic-first step strategy: reuse existing shared steps before creating codegen-specific steps.
10. When a new pattern is reusable across scenarios, create a new generic step in `features/step-definitions/generic/common.steps.ts` and use it immediately.

## Execution Commands
- `npm run clean; npx cucumber-js --profile default --tags "@TagName"; npx serenity-bdd run --features ./features`

## Output Rules
- Feature file: `features/codegen/<name>.feature`
- Step definitions: `features/step-definitions/codegen/<name>.steps.ts`
- Reuse shared expressions from `features/step-definitions/generic/common.steps.ts`.
- Do not silently overwrite existing files; ask before replacement.
- Prefer expanded mode by default.
- Keep page- or feature-specific component assertions in codegen-specific step files unless there is proven cross-feature reuse.

## Generic Reuse Decision Checklist
1. Search `features/step-definitions/generic/common.steps.ts` for an existing expression that can satisfy the intent with parameters.
2. If the same interaction/assertion appears or is expected to appear in 2 or more scenarios/features, treat it as reusable.
3. If only selector, role, text, URL fragment, or key input changes between scenarios, create/extend a generic parameterized step.
4. Keep codegen-specific steps only for truly domain-unique workflows.
5. Ensure a new expression does not conflict with existing step expressions.
6. When a new generic step is created, use it immediately in the generated feature and avoid leaving a duplicate one-off step.

## Guardrails
- Never convert from failing raw scripts.
- Keep tag consistency between feature tags and CLI `--tags` usage.
- Avoid duplicate step expressions that conflict in Cucumber.
- Enforce duplicate-safe generation by scanning existing step definitions before writing new ones.
- Include locator mapping traceability between generated Gherkin steps and step-definition implementations.
- Preserve converter-equivalent intelligence: common pattern detection, best-practice validation, and remediation guidance.
- Always include `serenity-bdd run` after `cucumber-js` when the user expects Serenity report output.

## Completion Criteria
- Feature and step files are generated at expected paths.
- Tag and naming conventions are consistent.
- Direct generation summary includes duplicate analysis, reused/common patterns, and skipped conflicts.
- Best-practice findings are surfaced with concrete remediation guidance.
- Execution commands are provided or run per request.

## Example Invocations
- Generate feature and steps from `codegen/payment_raw.spec.ts`.
- Intelligently generate feature and step definitions directly from a passing raw script, without converter CLI.
- Scaffold `features/codegen/search.feature` and matching step file from validated raw test.
