---
name: serenity-failure-healer
description: "Use when: diagnosing and fixing failing Serenity/JS Cucumber scenarios or raw Playwright scripts in test/e2e-serenity, analyzing failure screenshots and error logs, capturing deterministic DOM selectors using Playwright/Chrome DevTools, updating raw specs in codegen/, and propagating fixed Screenplay locators and steps to step-definitions/codegen/."
---

# Serenity Failure Healer Skill

Systematically diagnose, debug, and heal failing Serenity/JS BDD scenarios and raw Playwright scripts in **`test/e2e-serenity/`**.

## Working Directory
- Working Directory: **`test/e2e-serenity/`**

## Healing Workflow

### 1. Analyze the Failure Artifacts
- Check the Cucumber CLI error trace or Serenity/JS error report.
- Review failure screenshots captured in `target/site/serenity/*.png` or `test-results/`.
- Identify the exact failure category:
  - **Locator / Selector Mismatch** (e.g. element not found, changed text, dynamic ID).
  - **Timing / Race Condition** (e.g. animation, pending network request, unattached DOM element).
  - **Environment / Base URL Mismatch** (e.g. `localhost:3000` vs `https://uat.quickexamcreator.com`).

### 2. Capture Deterministic Locators
- Inspect the live application page using Chrome DevTools MCP or Playwright codegen.
- Prioritize stable, deterministic selectors:
  1. `id` (e.g. `#btn-save-workspace`, `#btn-proceed-workspace`)
  2. `data-testid` (e.g. `[data-testid="save-continue-btn"]`)
  3. `By.role('button', { name: 'Exact Name' })`
  4. Explicit text fallback with visibility check.
- **Never guess regexes** when exact DOM attributes are obtainable.

### 3. Stabilize the Raw Playwright Script First
- If a corresponding `codegen/<name>_raw.spec.ts` exists, update the failing interaction.
- Replay and confirm pass:
  ```sh
  npx playwright test -c playwright.codegen.config.ts codegen/<name>_raw.spec.ts
  ```

### 4. Propagate Fix to Serenity/JS Step Definitions
- Update the Screenplay PageElement in `step-definitions/codegen/<name>.steps.ts`:
  ```ts
  const SaveButton = () => PageElement.located(By.id('btn-save-workspace')).describedAs('Save button');
  ```
- Wrap actions with explicit wait and visibility guarantees:
  ```ts
  Wait.upTo(Duration.ofSeconds(15)).until(SaveButton(), isVisible()),
  ClickWhenReady(SaveButton())
  ```

### 5. Verify the Serenity/JS Cucumber Suite
- Re-run the tagged Cucumber test to ensure green execution:
  ```sh
  ENVIRONMENT=uat npx cucumber-js --tags "@<tag>"
  ```
- Confirm the new HTML report generated in `target/site/serenity/index.html` reflects the passing scenario.
