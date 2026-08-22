# QuickExamCreator (Pariksha / Vatra) Suite Consolidation & Cleanup Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the repository by removing foreign/legacy sample test suites (Amazon, RedBus, Dolo, HappiestHealth) and organizing all `quickexamcreator.com` (Pariksha / Vatra Assess) scenarios into a unified, consistently named structure with validated Screenplay step definitions and a synchronized `spkb.db`.

**Architecture:** 
- Restructure all QuickExamCreator BDD features and steps into a dedicated `features/quickexamcreator/` and `step-definitions/quickexamcreator/` namespace.
- Remove unrelated third-party artifacts (`redbus`, `dolo360`, `sonyheadphone_amazon`, `happiesthealth`).
- Standardize all Gherkin tags (`@quickexamcreator`, `@vatra`, `@smoke`, `@regression`).
- Synchronize `spkb.db` state tracking (`care_flows` and `page_nodes`) exclusively for `https://quickexamcreator.com`.

**Tech Stack:** Serenity/JS 3.x, Cucumber.js 10.x, Playwright 1.59.x, SQLite (`better-sqlite3`), TypeScript.

## Global Constraints
- All feature files must adhere to Cucumber Gherkin standards.
- All step definitions must follow Serenity/JS Screenplay Pattern (Actors, Tasks, PageElements, Ensure assertions).
- Zero ESLint errors/warnings (`npm run lint` must exit with 0).
- All Cucumber dry-runs (`npx cucumber-js --dry-run`) must pass without ambiguous or missing step definitions.

---

### Task 1: Prune Foreign & Legacy Third-Party Test Assets

**Files:**
- Delete: `features/codegen/dolo360.feature`
- Delete: `features/codegen/sonyheadphone_amazon.feature`
- Delete: `features/redbus/redbus.feature`
- Delete: `step-definitions/codegen/dolo360.steps.ts`
- Delete: `step-definitions/codegen/sonyheadphone_amazon.steps.ts`
- Delete: `step-definitions/home_page/happiesthealth.steps.ts`
- Delete: `step-definitions/redbus/redbus.steps.ts`
- Delete: `codegen/dolo360_raw.spec.ts`
- Delete: `codegen/sonyheadphone_amazon_raw.spec.ts`
- Delete: `codegen/sonyheadphone_raw.spec.ts`

- [ ] **Step 1: Remove foreign feature files and step definitions**
```bash
rm -rf features/redbus features/codegen/dolo360.feature features/codegen/sonyheadphone_amazon.feature
rm -rf step-definitions/redbus step-definitions/home_page step-definitions/codegen/dolo360.steps.ts step-definitions/codegen/sonyheadphone_amazon.steps.ts
rm -rf codegen/dolo360_raw.spec.ts codegen/sonyheadphone_amazon_raw.spec.ts codegen/sonyheadphone_raw.spec.ts
```

- [ ] **Step 2: Verify zero broken references with Cucumber dry-run**
```bash
npx cucumber-js --profile default --dry-run
```

- [ ] **Step 3: Commit pruning**
```bash
git add -A features/ step-definitions/ codegen/
git commit -m "chore: prune foreign legacy test suites (dolo, amazon, redbus, happiesthealth)"
```

---

### Task 2: Standardize Feature and Step Hierarchy for QuickExamCreator / Vatra

**Files:**
- Move & Rename:
  - `features/adsense_seo.feature` -> `features/quickexamcreator/adsense_seo.feature`
  - `features/pariksha_pure_ui.feature` -> `features/quickexamcreator/pariksha_pure_ui.feature`
  - `features/vatra_platform_features.feature` -> `features/quickexamcreator/vatra_platform_features.feature`
  - `features/codegen/document_upload_extractor.feature` -> `features/quickexamcreator/document_upload_extractor.feature`
  - `features/codegen/manual_authoring.feature` -> `features/quickexamcreator/manual_authoring.feature`
  - `features/codegen/pariksha_public_complete_flow.feature` -> `features/quickexamcreator/pariksha_public_complete_flow.feature`
  - `features/codegen/pariksha_scoring.feature` -> `features/quickexamcreator/pariksha_scoring.feature`
  - `features/codegen/topic_prompt_generator.feature` -> `features/quickexamcreator/topic_prompt_generator.feature`
  - `features/codegen/quickexamcreator.feature` -> `features/quickexamcreator/navigation_core.feature`
- Move & Rename Step Definitions:
  - `step-definitions/adsense_seo.steps.ts` -> `step-definitions/quickexamcreator/adsense_seo.steps.ts`
  - `step-definitions/pariksha_pure_ui.steps.ts` -> `step-definitions/quickexamcreator/pariksha_pure_ui.steps.ts`
  - `step-definitions/vatra_platform_features.steps.ts` -> `step-definitions/quickexamcreator/vatra_platform_features.steps.ts`
  - `step-definitions/codegen/document_upload_extractor.steps.ts` -> `step-definitions/quickexamcreator/document_upload_extractor.steps.ts`
  - `step-definitions/codegen/manual_authoring.steps.ts` -> `step-definitions/quickexamcreator/manual_authoring.steps.ts`
  - `step-definitions/codegen/pariksha_public_complete_flow.steps.ts` -> `step-definitions/quickexamcreator/pariksha_public_complete_flow.steps.ts`
  - `step-definitions/codegen/pariksha_scoring.steps.ts` -> `step-definitions/quickexamcreator/pariksha_scoring.steps.ts`
  - `step-definitions/codegen/topic_prompt_generator.steps.ts` -> `step-definitions/quickexamcreator/topic_prompt_generator.steps.ts`
  - `step-definitions/codegen/quickexamcreator.steps.ts` -> `step-definitions/quickexamcreator/navigation_core.steps.ts`

- [ ] **Step 1: Create unified quickexamcreator directories and move files**
```bash
mkdir -p features/quickexamcreator step-definitions/quickexamcreator
mv features/adsense_seo.feature features/quickexamcreator/
mv features/pariksha_pure_ui.feature features/quickexamcreator/
mv features/vatra_platform_features.feature features/quickexamcreator/
mv features/codegen/document_upload_extractor.feature features/quickexamcreator/
mv features/codegen/manual_authoring.feature features/quickexamcreator/
mv features/codegen/pariksha_public_complete_flow.feature features/quickexamcreator/
mv features/codegen/pariksha_scoring.feature features/quickexamcreator/
mv features/codegen/topic_prompt_generator.feature features/quickexamcreator/
mv features/codegen/quickexamcreator.feature features/quickexamcreator/navigation_core.feature

mv step-definitions/adsense_seo.steps.ts step-definitions/quickexamcreator/
mv step-definitions/pariksha_pure_ui.steps.ts step-definitions/quickexamcreator/
mv step-definitions/vatra_platform_features.steps.ts step-definitions/quickexamcreator/
mv step-definitions/codegen/document_upload_extractor.steps.ts step-definitions/quickexamcreator/
mv step-definitions/codegen/manual_authoring.steps.ts step-definitions/quickexamcreator/
mv step-definitions/codegen/pariksha_public_complete_flow.steps.ts step-definitions/quickexamcreator/
mv step-definitions/codegen/pariksha_scoring.steps.ts step-definitions/quickexamcreator/
mv step-definitions/codegen/topic_prompt_generator.steps.ts step-definitions/quickexamcreator/
mv step-definitions/codegen/quickexamcreator.steps.ts step-definitions/quickexamcreator/navigation_core.steps.ts
```

- [ ] **Step 2: Update relative imports for Navigation and Interactions in step files**
In moved step files, adjust `import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';` and `import { ClickWhenReady } from '../helpers/Interactions';`.

- [ ] **Step 3: Standardize Gherkin Tags**
Ensure every feature has `@quickexamcreator @vatra` tags in addition to functional tags (`@smoke`, `@authoring`, `@scoring`, `@seo`).

- [ ] **Step 4: Verify with Cucumber Dry-Run & Lint**
```bash
npm run lint && npx cucumber-js --profile default --dry-run
```

- [ ] **Step 5: Commit restructuring**
```bash
git add -A features/ step-definitions/
git commit -m "refactor(structure): consolidate all QuickExamCreator/Vatra test suites into unified namespace"
```

---

### Task 3: Clean & Synchronize `spkb.db` Knowledge Base

**Files:**
- Database: `spkb.db`
- Script: Sync script execution

- [ ] **Step 1: Clear foreign entries and re-index all QuickExamCreator flows**
Run clean sync script that truncates `care_flows` and repopulates only the 9 official QuickExamCreator test suites with SHA-256 signatures.

- [ ] **Step 2: Verify `care_flows` and `page_nodes` in `spkb.db`**
```bash
npm run care:status
```
Expected output: Exactly 9 QuickExamCreator / Vatra flows listed.

- [ ] **Step 3: Run CARE unit tests to ensure 100% pass**
```bash
npx ts-node --transpile-only test/care/config.spec.ts && npx ts-node --transpile-only test/care/state-tracker.spec.ts && npx ts-node --transpile-only test/care/stability-gate.spec.ts && npx ts-node --transpile-only test/care/pr-publisher.spec.ts && npx ts-node --transpile-only test/care/daemon.spec.ts
```

- [ ] **Step 4: Commit database sync & documentation**
```bash
git add package.json
git commit -m "chore(spkb): clean and synchronize spkb.db state tracking for quickexamcreator.com"
```

---

## Verification Plan

### Automated Tests
1. **Cucumber Dry-Run**:
   ```bash
   npx cucumber-js --profile default --dry-run
   ```
   *Confirms 100% of Gherkin steps map cleanly to TypeScript step definitions.*

2. **ESLint**:
   ```bash
   npm run lint
   ```
   *Confirms 0 errors and 0 warnings.*

3. **CARE Engine Unit Tests**:
   ```bash
   npm run care:status
   ```
   *Confirms spkb.db accurately tracks all 9 quickexamcreator flows.*

4. **Live Container Restart Verification**:
   ```bash
   docker compose restart
   docker compose logs --tail=20
   ```
