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
Convert this raw Playwright test into a Gherkin feature file.
Raw Script:
${rawScript}

Rules:
1. Tags: @${flowName} @smoke @e2e
2. Feature: ${flowName} Flow
3. Return ONLY the Gherkin content in \`\`\`gherkin ... \`\`\`.
`;
        const featureOutput = await this.llm.generate(featurePrompt);
        const featureMatch = featureOutput.match(/```(?:gherkin|feature)?([\s\S]*?)```/);
        const feature = featureMatch ? featureMatch[1].trim() : featureOutput.trim();

        const stepsPrompt = `
You are the "serenity-script-generator" agent generating Serenity/JS Screenplay step definitions for Cucumber.
Feature:
${feature}
Raw Script:
${rawScript}

Rules:
1. Import from '@cucumber/cucumber', '@serenity-js/core', '@serenity-js/assertions', '@serenity-js/web'.
2. Use Screenplay pattern: actorInTheSpotlight().attemptsTo(Click.on(...), Ensure.eventually(...)).
3. Return ONLY TypeScript code in \`\`\`typescript ... \`\`\`.
`;
        const stepsOutput = await this.llm.generate(stepsPrompt);
        const stepsMatch = stepsOutput.match(/```(?:typescript|ts)?([\s\S]*?)```/);
        const steps = stepsMatch ? stepsMatch[1].trim() : stepsOutput.trim();

        return { feature, steps };
    }
}
