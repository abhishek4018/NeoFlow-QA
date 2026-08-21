import { test, expect } from '@playwright/test';
import { ASTAssertionLinter } from '../../src/auditor/ast-linter';

test.describe('AST Assertion Hardness Linter (Zero-Shortcut Policy)', () => {
    const linter = new ASTAssertionLinter();

    test('rejects loose existence checks without state validation', () => {
        const codeSnippet = `
            import { Ensure, isPresent } from '@serenity-js/assertions';
            import { PageElement, By } from '@serenity-js/web';

            Then('element is present', async () => {
                await actorInTheSpotlight().attemptsTo(
                    Ensure.that(PageElement.located(By.css('.modal')), isPresent())
                );
            });
        `;

        const result = linter.lint(codeSnippet);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Forbidden loose assertion "isPresent()" without visibility or state validation');
    });

    test('rejects empty catch blocks and ignored errors', () => {
        const codeSnippet = `
            When('user clicks button', async () => {
                try {
                    await page.click('button');
                } catch (e) {
                    // silently ignore error
                }
            });
        `;

        const result = linter.lint(codeSnippet);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Forbidden empty catch block detected; silent test passing is not permitted');
    });

    test('rejects hardcoded sleeps and timeouts', () => {
        const codeSnippet = `
            When('user waits', async () => {
                await page.waitForTimeout(5000);
            });
        `;

        const result = linter.lint(codeSnippet);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Forbidden hardcoded sleep "waitForTimeout()" detected; use event-driven synchronization');
    });

    test('approves strict, event-driven Screenplay step definitions', () => {
        const codeSnippet = `
            import { Ensure, includes } from '@serenity-js/assertions';
            import { PageElement, By, Click, Page } from '@serenity-js/web';

            When('user navigates to {string}', async (name: string) => {
                await actorInTheSpotlight().attemptsTo(
                    Click.on(PageElement.located(By.xpath(\`//nav//a[normalize-space()='\${name}']\`)))
                );
            });

            Then('url should contain {string}', async (urlPart: string) => {
                await actorInTheSpotlight().attemptsTo(
                    Ensure.eventually(Page.current().url().href, includes(urlPart))
                );
            });
        `;

        const result = linter.lint(codeSnippet);
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
    });
});
