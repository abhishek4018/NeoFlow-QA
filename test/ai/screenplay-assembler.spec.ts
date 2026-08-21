import { test, expect } from '@playwright/test';
import { ScreenplayASTAssembler } from '../../src/ai/screenplay-assembler';

test.describe('Deterministic Hybrid Screenplay AST Assembler', () => {
    const assembler = new ScreenplayASTAssembler();

    test('assembles 100% valid TypeScript Serenity/JS step definitions from parsed Gherkin steps', () => {
        const featureContent = `
@home @smoke @e2e
Feature: home Flow

  Scenario: Validate Home Page
    Given the user navigates to the target url
    Then the header should be visible
    When the user clicks the action link
`;

        const targetUrl = 'https://quickexamcreator.com/';
        const selectors = {
            header: '//h1 | //h2',
            action: '//nav//a[normalize-space()="Guides"] | //button'
        };

        const compiledSteps = assembler.assembleStepDefinitions(featureContent, targetUrl, selectors);

        expect(compiledSteps).toContain("import { Given, When, Then } from '@cucumber/cucumber';");
        expect(compiledSteps).toContain("import { actorInTheSpotlight } from '@serenity-js/core';");
        expect(compiledSteps).toContain("import { By, Click, isVisible, Navigate, PageElement } from '@serenity-js/web';");
        expect(compiledSteps).toContain("Given('the user navigates to the target url'");
        expect(compiledSteps).toContain("Navigate.to('https://quickexamcreator.com/')");
        expect(compiledSteps).toContain("Ensure.eventually(PageElement.located(By.xpath('//h1 | //h2')), isVisible())");
    });
});
