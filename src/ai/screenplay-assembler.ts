import { InteractiveElementAction } from '../explorer/types';

export interface ExtractedSelectors {
    header?: string;
    action?: string;
    actions?: InteractiveElementAction[];
}

export class ScreenplayASTAssembler {
    public assembleStepDefinitions(featureContent: string, targetUrl: string, selectors: ExtractedSelectors = {}): string {
        const actions = selectors.actions || [];
        let actionCursor = 0;

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

            const upperKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
            const escapedExpr = expression.replace(/'/g, "\\'");

            // 1. Navigation Steps: Use centralized generic navigation and avoid hardcoded URLs
            if (upperKeyword === 'Given' || /navigat/i.test(expression) || /visit/i.test(expression)) {
                // If expression matches the generic pattern, skip emitting duplicate local handler
                if (/^the user navigates to the \w+ url$/i.test(expression) || /^the user navigates to "/i.test(expression) || /^the user navigates to '/i.test(expression)) {
                    continue;
                }
                const routePath = new URL(targetUrl).pathname || '/';
                generatedStepHandlers.push(`
Given('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('${routePath}')
    );
});`);
            } 
            // Skip DataTable step since it is implemented generically in generic.steps.ts
            else if (/the following key elements should be visible/i.test(expression)) {
                continue;
            } 
            // 2. Action Steps: Map distinct action selectors for each interaction
            else if (upperKeyword === 'When' || /click|button|link|action|press|enter|type/i.test(expression)) {
                const currentAction = actions[actionCursor] || (selectors.action ? { selector: selectors.action, actionType: 'click' } : undefined);
                actionCursor++;
                const selector = currentAction?.selector || '//nav//a[1] | //button[1] | //a[1]';
                const actionBy = selector.startsWith('//') || selector.startsWith('(')
                    ? `By.xpath('${selector.replace(/'/g, "\\'")}')`
                    : `By.css('${selector.replace(/'/g, "\\'")}')`;

                generatedStepHandlers.push(`
When('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(${actionBy}))
    );
});`);
            } 
            // 3. Assertion Steps: Semantic assertions for Title, Headings, and Content
            else {
                if (/title/i.test(expression) && /"([^"]+)"/.test(expression)) {
                    const titleMatch = expression.match(/"([^"]+)"/);
                    const expectedTitle = titleMatch ? titleMatch[1] : '';
                    generatedStepHandlers.push(`
Then('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(Page.current().title(), includes('${expectedTitle}'))
    );
});`);
                } else if (/heading|header|visible/i.test(expression)) {
                    generatedStepHandlers.push(`
Then('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, main')), isVisible())
    );
});`);
                } else {
                    generatedStepHandlers.push(`
Then('${escapedExpr}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('body')), isVisible())
    );
});`);
                }
            }
        }

        return `import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, Page, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

${generatedStepHandlers.join('\n\n')}
` + '\n';
    }
}
