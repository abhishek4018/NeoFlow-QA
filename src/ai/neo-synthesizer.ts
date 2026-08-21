import { OllamaClient } from '../ai/ollama-client';
import { InteractiveElementAction } from '../explorer/types';

export class NeoScriptSynthesizer {
    private llm: OllamaClient;

    constructor(llmClient?: OllamaClient) {
        this.llm = llmClient || new OllamaClient();
    }

    public sanitizeFilename(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    public async generateRawSpec(url: string, title: string, actions: InteractiveElementAction[]): Promise<string> {
        const prompt = `
You are the "playwright-script-generator" agent in the NeoFlow-QA repository.
Given target page:
- URL: ${url}
- Title: ${title}
- Discovered actions: ${JSON.stringify(actions.slice(0, 8), null, 2)}

Generate a clean, stable raw Playwright test script in TypeScript using '@playwright/test'.
Rules:
1. Wrap in: test('validate ${title}', async ({ page }) => { ... })
2. Navigate to '${url}'
3. Assert page title or heading is visible
4. Click or interact with 1-2 primary elements from the discovered actions
5. Return ONLY the TypeScript code enclosed in \`\`\`typescript ... \`\`\`. No explanation.
`;
        const output = await this.llm.generate(prompt);
        const match = output.match(/```(?:typescript|ts)?([\s\S]*?)```/);
        return match ? match[1].trim() : output.trim();
    }

    public async generateBDDAssets(flowName: string, rawScript: string): Promise<{ feature: string; steps: string }> {
        const featurePrompt = `
You are the "serenity-script-generator" agent.
Convert this raw Playwright test into a clean, valid Gherkin feature file for Cucumber.js.
Raw Script:
${rawScript}

Rules:
1. Include tags: @${flowName} @smoke @e2e
2. Structure:
@${flowName} @smoke @e2e
Feature: ${flowName} Flow

  Scenario: Validate ${flowName} Page
    Given the user navigates to the target url
    Then the header should be visible
    When the user clicks the action link
3. Return ONLY valid Gherkin text. No markdown explanation.
`;
        const featureOutput = await this.llm.generate(featurePrompt);
        const featureMatch = featureOutput.match(/```(?:gherkin|feature)?([\s\S]*?)```/);
        const feature = (featureMatch ? featureMatch[1] : featureOutput).trim();

        const stepsPrompt = `
You are the "serenity-script-generator" agent writing TypeScript step definitions for Cucumber.js + Serenity/JS 3.

EXACT IMPORTS TO USE:
import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Ensure, equals, isVisible } from '@serenity-js/assertions';
import { By, Click, Navigate, Page, PageElement } from '@serenity-js/web';

EXACT FORMAT FOR STEP DEFINITIONS:
Given('the user navigates to the target url', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/${flowName}')
    );
});

Then('the header should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.xpath('//h1 | //h2')), isVisible())
    );
});

When('the user clicks the action link', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a | //button')))
    );
});

Based on this Feature:
${feature}

Generate the exact matching TypeScript step definitions following the EXACT syntax and imports shown above.
Return ONLY TypeScript code enclosed in \`\`\`typescript ... \`\`\`.
`;
        const stepsOutput = await this.llm.generate(stepsPrompt);
        const stepsMatch = stepsOutput.match(/```(?:typescript|ts)?([\s\S]*?)```/);
        const steps = (stepsMatch ? stepsMatch[1] : stepsOutput).trim();

        return { feature, steps };
    }
}
