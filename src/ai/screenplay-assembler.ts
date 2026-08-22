export interface ExtractedSelectors {
    header?: string;
    action?: string;
}

export class ScreenplayASTAssembler {
    public assembleStepDefinitions(featureContent: string, targetUrl: string, selectors: ExtractedSelectors = {}): string {
        const headerSelector = selectors.header || '//h1 | //h2 | //h3 | //header | //main';
        const actionSelector = selectors.action || '//nav//a[1] | //button[1] | //a[1]';

        // Extract Gherkin Step expressions from feature text
        const stepLines = featureContent
            .split('\n')
            .map(l => l.trim())
            .filter(l => /^(Given|When|Then|And|But)\s+/i.test(l));

        const generatedStepHandlers: string[] = [];
        const registeredExpressions = new Set<string>();

        for (const line of stepLines) {
            const match = line.match(/^(Given|When|Then|And|But)\s+(.*)$/i);
            if (!match) continue;

            const keyword = match[1].toLowerCase() === 'and' || match[1].toLowerCase() === 'but' ? 'Then' : match[1];
            const expression = match[2].trim();

            if (registeredExpressions.has(expression)) continue;
            registeredExpressions.add(expression);

            const _headerBy = headerSelector.startsWith('//') || headerSelector.startsWith('(')
                ? `By.xpath('${headerSelector}')`
                : `By.css('${headerSelector}')`;
            const actionBy = actionSelector.startsWith('//') || actionSelector.startsWith('(')
                ? `By.xpath('${actionSelector}')`
                : `By.css('${actionSelector}')`;
            const upperKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();

            const escapedExpr = expression.replace(/'/g, "\\'");

            if (upperKeyword === 'Given' || /navigat/i.test(expression) || /visit/i.test(expression)) {
                // Skip if expression is already covered by generic.steps.ts
                if (/^the user navigates to the \w+ url$/i.test(expression) || /^the user navigates to "/i.test(expression)) {
                    continue;
                }
                const routePath = new URL(targetUrl).pathname || '/';
                generatedStepHandlers.push(`
Given('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('${routePath}')
    );
});`);
            } else if (upperKeyword === 'When' || /click|button|link|action|press/i.test(expression)) {
                generatedStepHandlers.push(`
When('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(${actionBy}))
    );
});`);
            } else {
                generatedStepHandlers.push(`
Then('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1')), isVisible())
    );
});`);
            }
        }

        return `import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

${generatedStepHandlers.join('\n\n')}
` + '\n';
    }
}
