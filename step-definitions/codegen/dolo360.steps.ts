import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, Click, PageElement } from '@serenity-js/web';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

When('the user presses {string} in the element with aria-label {string}', async (key: string, label: string) => {
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

    await page.locator(`[aria-label="${label}"]`).press(key);
});

When('the user adds the first search result to cart', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('(//button[@aria-label="Add to cart"])[1]')))
    );
});

Then('the cart icon should be visible', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (!page) {
        throw new Error('Could not resolve the Playwright page to verify the cart icon');
    }

    await expect(page.locator('a.Header__cartContainer__UrAHF[href="/cart"]')).toBeVisible({ timeout: 20000 });
});
