# Repository Agents

This repository defines custom VS Code agents for BDD generation and test automation workflows.

## Available agents

- `neo`
  - Path: `.github/agents/neo.agent.md`
  - Purpose: Generate and heal SerenityJS BDD assets from natural-language scenarios, feature snippets, or test failures by enforcing a structured workflow:
    1. raw Playwright script generation & stabilization via `playwright-script-generator`
    2. BDD feature and step-definition generation via `serenity-script-generator`
    3. automated failure diagnosis & locator healing via `serenity-failure-healer`
