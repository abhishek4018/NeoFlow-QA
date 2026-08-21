---
name: serenity-script-generator
description: "Use when: generating SerenityJS BDD assets in test/e2e-serenity, creating feature files and step definitions directly from a passing raw Playwright script, intelligently extracting locators and actions, applying duplicate-step detection and common-pattern analysis, validating best-practice patterns, scaffolding features/codegen and step-definitions/codegen outputs inside test/e2e-serenity, applying Cucumber tag conventions, and executing cucumber-js plus serenity-bdd reporting flow."
required-skills: ["serenity-js-mandatory-steps"]
---
## Mandatory Steps

1. **Use SerenityJS Interaction Helpers**
   - Prefer `ClickWhenReady` (or other custom interaction helpers) over raw `Click.on` or direct Playwright calls.
   - Use `Enter`, `Navigate`, `Wait`, `Ensure`, `Text`, and other SerenityJS primitives for all UI interactions.

2. **Avoid Direct Playwright Page Manipulation**
   - Do **not** access `page.locator` or `page.click` directly inside step definitions.
   - When low‑level Playwright actions are required, wrap them in a SerenityJS `Interaction` that can be reused.

3. **Explicit Waits**
   - Always pair an action with an explicit wait (e.g., `Wait.upTo(Duration.ofSeconds(...)).until(element, isVisible())`).
   - Use `isEnabled`, `isVisible`, or custom conditions before interacting.

4. **Navigation Helper**
   - Use the shared `NavigateToAppAndAcceptCookies(url)` helper for any navigation that may involve a cookie banner.

5. **Consistent Element Locators**
   - Define element locators as **named functions** returning `PageElement.located(By....)`.
   - Keep locator definitions in a single file per domain (e.g., `helpers/Elements.ts`).

6. **Error Handling**
   - Throw descriptive errors using SerenityJS `AssertionError` or custom error classes.
   - Wrap fragile actions in try/catch blocks and log using `actor.attemptsTo(LogMessage…)` if needed.

7. **Documentation**
   - Add JSDoc comments to each step definition explaining the purpose, parameters, and any special conditions.

---

## How to Apply

- Run the provided **lint rule script** (`npm run lint:serenity`) which scans for prohibited patterns (`Click.on`, direct `page.*` usage) and suggests replacements.
- Use the **Refactor helper CLI** (`npx -y serenity-js-refactor-cli ./`) to automatically apply the mandatory steps where possible.
- When adding new step definitions, reference this skill in the file header comment:

```ts
// @serenity-js-mandatory-steps
```

---

## Enforcement

- CI will fail if any step definition violates the mandatory steps (detected by the lint rule).
- PR reviewers should verify compliance using the `serenity-js-mandatory-steps` checklist.

# Serenity Script Generator

Generate Serenity-compatible feature and step-definition artifacts targeting **`test/e2e-serenity/`**.

## Working Directory
- Working Directory: **`test/e2e-serenity/`**

## Scope
- Convert a passing raw script (`test/e2e-serenity/codegen/<name>_raw.spec.ts`) to feature (`test/e2e-serenity/features/codegen/<name>.feature`) and step definitions (`test/e2e-serenity/step-definitions/codegen/<name>.steps.ts`).
- Execute Cucumber & Serenity report pipeline:
  - `cd test/e2e-serenity && ENVIRONMENT=uat npm run test:smoke`
  - `cd test/e2e-serenity && npx cucumber-js --tags "@smoke"`
