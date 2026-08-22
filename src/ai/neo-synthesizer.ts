import { OllamaClient } from '../ai/ollama-client';
import { InteractiveElementAction } from '../explorer/types';
import { ScreenplayASTAssembler } from './screenplay-assembler';

export class NeoScriptSynthesizer {
    private llm: OllamaClient;

    constructor(llmClient?: OllamaClient) {
        this.llm = llmClient || new OllamaClient();
    }

    public sanitizeFilename(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    public async generateRawSpec(url: string, title: string, actions: InteractiveElementAction[]): Promise<string> {
        const sanitizedTitle = (title || 'Page').replace(/['"\\]/g, '').slice(0, 50);
        const actionSnippet = actions.length > 0
            ? `    await page.locator('${actions[0].selector.replace(/'/g, "\\'")}').first().click();`
            : '';

        try {
            const prompt = `
You are the "playwright-script-generator" agent in the NeoFlow-QA repository.
Given target page:
- URL: ${url}
- Title: ${title}
- Discovered actions: ${JSON.stringify(actions.slice(0, 8), null, 2)}

Generate a clean, stable raw Playwright test script in TypeScript using '@playwright/test'.
Rules:
1. Wrap in: test('validate ${sanitizedTitle}', async ({ page }) => { ... })
2. Navigate to '${url}'
3. Assert page title or heading is visible
4. Click or interact with 1-2 primary elements from the discovered actions
5. Return ONLY the TypeScript code enclosed in \`\`\`typescript ... \`\`\`. No explanation.
`;
            const output = await this.llm.generate(prompt);
            const match = output.match(/```(?:typescript|ts)?([\s\S]*?)```/);
            let raw = (match ? match[1] : output).trim();

            if (!raw.includes('@playwright/test')) {
                raw = `import { test, expect } from '@playwright/test';\n\n` + raw;
            }
            return raw;
        } catch (error) {
            console.log(`ℹ️ [NeoSynthesizer] LLM offline or unreachable, using deterministic Screenplay synthesis.`);
            return `import { test, expect } from '@playwright/test';

test('validate ${sanitizedTitle}', async ({ page }) => {
    await page.goto('${url}');
    await expect(page.locator('h1, h2, header, main').first()).toBeVisible();
${actionSnippet}
});
`;
        }
    }

    public async generateBDDAssets(
        flowName: string,
        rawScript: string,
        targetUrl?: string,
        selectors?: {
            header?: string;
            action?: string;
            actions?: InteractiveElementAction[];
            baseRouteName?: string;
            actionLabel?: string;
            inventory?: import('../explorer/types').PageElementInventory;
        }
    ): Promise<{ feature: string; steps: string }> {
        let feature = '';
        const baseRoute = selectors?.baseRouteName || 'home';
        const actionLabel = selectors?.actionLabel || flowName;
        const inventory = selectors?.inventory;

        let dataTableBlock = '';
        if (inventory && inventory.items && inventory.items.length > 0) {
            const tableRows = inventory.items.slice(0, 8).map(
                item => `      | ${item.elementType.padEnd(12)} | ${item.identifier.padEnd(30)} | ${(item.targetRole || item.elementType).padEnd(10)} |`
            ).join('\n');

            dataTableBlock = `\n    And the following key elements should be visible on the page:\n      | Element Type | Identifier / Text              | Target Role |\n${tableRows}`;
        }

        try {
            const featurePrompt = `
You are the "serenity-script-generator" agent.
Convert this raw Playwright test into a clean, valid Gherkin feature file for Cucumber.js.
Raw Script:
${rawScript}

Rules:
1. Include tags: @${flowName} @quickexamcreator @vatra
2. Structure:
@${flowName} @quickexamcreator @vatra
Feature: ${flowName} Flow

  Scenario: Validate ${flowName} User Journey
    Given the user navigates to the ${baseRoute} url
    When the user clicks the primary navigation link for ${actionLabel}
    Then the main heading for ${actionLabel} should be visible${dataTableBlock}
3. Always navigate to the starting page using: "Given the user navigates to the ${baseRoute} url"
4. Return ONLY valid Gherkin text. No markdown explanation.
`;
            const featureOutput = await this.llm.generate(featurePrompt);
            const featureMatch = featureOutput.match(/```(?:gherkin|feature)?([\s\S]*?)```/);
            feature = (featureMatch ? featureMatch[1] : featureOutput).trim();
        } catch (error) {
            feature = `@${flowName} @quickexamcreator @vatra
Feature: ${flowName} Flow

  Scenario: Validate ${flowName} User Journey
    Given the user navigates to the ${baseRoute} url
    When the user clicks the primary navigation link for ${actionLabel}
    Then the main heading for ${actionLabel} should be visible${dataTableBlock}
`;
        }

        // Deterministic Screenplay AST Assembly (eliminates small LLM TypeScript hallucinations)
        const assembler = new ScreenplayASTAssembler();
        const steps = assembler.assembleStepDefinitions(feature, targetUrl || `https://quickexamcreator.com/${baseRoute}`, selectors);

        return { feature, steps };
    }
}
