---
name: serenity-script-generator
description: "Use when: generating SerenityJS BDD assets in test/e2e-serenity, creating feature files and step definitions directly from a passing raw Playwright script, intelligently extracting locators and actions, applying duplicate-step detection and common-pattern analysis, validating best-practice patterns, scaffolding features/codegen and step-definitions/codegen outputs inside test/e2e-serenity, applying Cucumber tag conventions, and executing cucumber-js plus serenity-bdd reporting flow."
---

# Serenity Script Generator

Generate Serenity-compatible feature and step-definition artifacts targeting **`test/e2e-serenity/`**.

## Working Directory
- Working Directory: **`test/e2e-serenity/`**

## Scope
- Convert a passing raw script (`test/e2e-serenity/codegen/<name>_raw.spec.ts`) to feature (`test/e2e-serenity/features/codegen/<name>.feature`) and step definitions (`test/e2e-serenity/step-definitions/codegen/<name>.steps.ts`).
- Execute Cucumber & Serenity report pipeline:
  - `cd test/e2e-serenity && ENVIRONMENT=uat npm run test:smoke`
  - `cd test/e2e-serenity && npx cucumber-js --tags "@smoke"`
