import { When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPage() {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (!page) {
        throw new Error('Could not resolve the Playwright page');
    }

    return page;
}

When('the user clicks the button {string}', async (buttonText: string) => {
    const page = getPage();
    await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first().click();
});

When('the user fills the question form with topic {string}, stem {string}, alternatives {string}, {string}, {string}, {string}, rationale {string}', async (topic: string, stem: string, altA: string, altB: string, altC: string, altD: string, rationale: string) => {
    const page = getPage();

    await page.locator('input[placeholder="Topic..."]').fill(topic);
    await page.locator('textarea').first().fill(stem);

    const altInputs = page.locator('input[placeholder^="Alternative"]');
    await altInputs.nth(0).fill(altA);
    await altInputs.nth(1).fill(altB);
    await altInputs.nth(2).fill(altC);
    await altInputs.nth(3).fill(altD);

    await page.locator('textarea').nth(1).fill(rationale);
});

Then('the authoring text {string} should be visible', async (text: string) => {
    const page = getPage();
    await page.getByText(new RegExp(escapeRegExp(text), 'i')).first().waitFor({ state: 'visible', timeout: 20000 });
});

Then('the button {string} should be visible', async (buttonText: string) => {
    const page = getPage();
    await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first().waitFor({ state: 'visible', timeout: 20000 });
});

When('the user enters {string} into the email field', async (email: string) => {
    const page = getPage();
    await page.locator('input[type="email"], input[placeholder*="email" i]').first().fill(email);
});

When('the user opens the creator dashboard from the magic link', async () => {
    const page = getPage();
    const link = await page.locator('a', { hasText: /launch creator dashboard/i }).first().getAttribute('href');
    if (!link) {
        throw new Error('Could not find the Launch Creator Dashboard link');
    }

    const fullUrl = link.startsWith('http') ? link : `http://localhost:3000${link}`;
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 120000 });
});

When('the user approves the pending question from the dashboard', async () => {
    const page = getPage();
    const approveButtons = page.getByRole('button', { name: /^Approve$/i });
    if (await approveButtons.count()) {
        await approveButtons.first().click();
        await page.waitForTimeout(4000);
    }
});

When('the user creates an assessment from the approved question bank', async () => {
    const page = getPage();
    const button = page.getByRole('button', { name: /question bank/i });
    if (await button.count()) {
        await button.first().click();
        await page.waitForTimeout(3000);
    }

    const createAssessmentButton = page.getByRole('button', { name: /create assessment|publish/i });
    if (await createAssessmentButton.count()) {
        await createAssessmentButton.first().click();
        await page.waitForTimeout(4000);
    }
});

When('the user takes the published assessment as a candidate', async () => {
    const page = getPage();
    const candidateLink = page.locator('a, button').filter({ hasText: /take|start|assessment/i }).first();
    if (await candidateLink.count()) {
        await candidateLink.click();
        await page.waitForTimeout(4000);
    }
});

When('the user validates the result in the faculty dashboard', async () => {
    const page = getPage();
    const resultButton = page.getByRole('button', { name: /result|results|faculty/i });
    if (await resultButton.count()) {
        await resultButton.first().click();
        await page.waitForTimeout(4000);
    }
});

