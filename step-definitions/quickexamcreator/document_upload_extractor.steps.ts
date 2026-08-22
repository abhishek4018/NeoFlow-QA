import { Given, Then,When } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

function getPage() {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (!page) {
        throw new Error('Could not resolve Playwright page from Serenity ability');
    }

    return page;
}

Given('candidate opens Pariksha Public Page at {string}', async (url: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(url)
    );
});

When('candidate ensures {string} mode is active', async (modeName: string) => {
    const page = getPage();
    const modeBtn = page.getByRole('button', { name: new RegExp(modeName, 'i') });
    if (await modeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await modeBtn.click();
    }
});

When('candidate uploads document named {string} with content {string}', async (fileName: string, content: string) => {
    const page = getPage();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
        name: fileName,
        mimeType: 'text/plain',
        buffer: Buffer.from(content)
    });
});

Then('file preview badge for {string} should be visible with a Remove button', async (fileName: string) => {
    const page = getPage();
    const fileBadge = page.getByText(fileName);
    await fileBadge.waitFor({ state: 'visible', timeout: 5000 });

    const removeBtn = page.getByRole('button', { name: /Remove/i });
    await removeBtn.waitFor({ state: 'visible', timeout: 5000 });
});

When('candidate removes the uploaded document {string}', async (_fileName: string) => {
    const page = getPage();
    const removeBtn = page.getByRole('button', { name: /Remove/i });
    await removeBtn.click();
});

Then('file preview badge for {string} should not be visible', async (fileName: string) => {
    const page = getPage();
    const fileBadge = page.getByText(fileName);
    await fileBadge.waitFor({ state: 'detached', timeout: 5000 });
});

When('candidate clicks Extract & Generate Questions button', async () => {
    const page = getPage();
    const generateBtn = page.locator('#btn-generate-questions');
    await generateBtn.click();
});

Then('extracted questions results view should be displayed', async () => {
    const page = getPage();
    const resultsHeader = page.getByText(/AI Engine Generation Complete|Analyzing document|Analyzing and extracting questions|Questions/i).first();
    await resultsHeader.waitFor({ state: 'visible', timeout: 60000 });
});
