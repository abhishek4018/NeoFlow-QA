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

            const headerBy = headerSelector.startsWith('//') || headerSelector.startsWith('(')
                ? `By.xpath('${headerSelector}')`
                : `By.css('${headerSelector}')`;
            const actionBy = actionSelector.startsWith('//') || actionSelector.startsWith('(')
                ? `By.xpath('${actionSelector}')`
                : `By.css('${actionSelector}')`;
            const upperKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();

            if (upperKeyword === 'Given' || /navigat/i.test(expression) || /visit/i.test(expression)) {
                generatedStepHandlers.push(`
Given('${expression}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('${targetUrl}')
    );
});`);
            } else if (upperKeyword === 'When' || /click|button|link|action|press/i.test(expression)) {
                generatedStepHandlers.push(`
When('${expression}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(${actionBy}))
    );
});`);
            } else {
                generatedStepHandlers.push(`
Then('${expression}', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(${headerBy}), isVisible())
    );
});`);
            }
        }

        const imports = `import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import { By, Click, isVisible, Navigate, PageElement } from '@serenity-js/web';\n`;

        return imports + generatedStepHandlers.join('\n') + '\n';
    }
}
