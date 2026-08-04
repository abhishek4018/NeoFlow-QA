---
name: serenity-script-generator
description: "Use when: generating SerenityJS BDD assets, creating feature files and step definitions directly from a passing raw Playwright script, intelligently extracting locators and actions, applying duplicate-step detection and common-pattern analysis, validating best-practice patterns, scaffolding features/codegen and step-definitions/codegen outputs, applying Cucumber tag conventions, and executing cucumber-js plus serenity-bdd reporting flow."
---

# Serenity Script Generator

Generate Serenity-compatible feature and step-definition artifacts from validated raw scripts.

## Scope

This skill is only for BDD artifact generation and Serenity execution flow.

Do:
- Convert a passing raw script (`codegen/<name>_raw.spec.ts`) to feature (`features/codegen/<name>.feature`) and step definitions (`step-definitions/codegen/<name>.steps.ts`).
- Execute Cucumber & Serenity report pipeline:
  - `ENVIRONMENT=uat npm run test:smoke`
  - `npx cucumber-js --tags "@smoke"`
