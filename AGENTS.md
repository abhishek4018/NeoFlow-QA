# Repository Agents

This repository defines custom VS Code agents for BDD generation and test automation workflows.

## Available agents

- `neo`
  - Path: `.github/agents/neo.agent.md`
  - Purpose: Generate SerenityJS BDD assets from natural-language scenarios, feature snippets, or raw Playwright scripts by enforcing a strict two-stage workflow:
    1. raw Playwright script generation/stabilization via `playwright-script-generator`
    2. BDD feature and step-definition generation via `serenity-script-generator`
