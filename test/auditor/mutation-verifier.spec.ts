import { expect,test } from '@playwright/test';

import { MutationVerifier } from '../../src/auditor/mutation-verifier';

test.describe('Mutation Test Verifier (Anti-Tautology Gate)', () => {
    const verifier = new MutationVerifier();

    test('generates an inverted mutation of an assertion step', () => {
        const originalStep = `
            Then('the title should be {string}', async (title: string) => {
                await actorInTheSpotlight().attemptsTo(
                    Ensure.eventually(Page.current().title(), equals(title))
                );
            });
        `;

        const mutatedStep = verifier.mutateAssertion(originalStep);
        expect(mutatedStep).not.toEqual(originalStep);
        expect(mutatedStep).toContain('__MUTATED_INVALID_ASSERTION__');
    });

    test('validates that sharp tests fail when assertions are inverted', async () => {
        const isSharp = await verifier.verifySharpness({
            testRunCommand: 'npx playwright test -c playwright.codegen.config.ts codegen/quickexamcreator_raw.spec.ts'
        });
        expect(isSharp).toBe(true);
    });
});
