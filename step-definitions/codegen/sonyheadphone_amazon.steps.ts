import { Given, Then,When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { actorInTheSpotlight } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { By, Enter, Navigate, PageElement } from '@serenity-js/web';

Given('the user opens the Amazon home page', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://www.amazon.com/')
    );
});

When('the user enters {string} into the element with id {string}', async (value: string, id: string) => {
    await actorInTheSpotlight().attemptsTo(
        Enter.theValue(value).into(PageElement.located(By.css(`#${id}`)))
    );
});

When('the user presses {string} in the element with id {string}', async (key: string, id: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (!page) {
        throw new Error('Could not resolve the Playwright page from the BrowseTheWebWithPlaywright ability');
    }

    await page.locator(`#${id}`).press(key);
});

Then('the search results should contain {string}', async (expectedText: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (!page) {
        throw new Error('Could not resolve the Playwright page from the BrowseTheWebWithPlaywright ability');
    }

    const locator = page.locator('span.a-color-state, span.a-size-medium.a-color-base.a-text-normal').first();
    await expect(locator).toContainText(expectedText, { timeout: 30000 });
});
