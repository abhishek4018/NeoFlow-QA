import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

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

Given('the user opens the Pariksha Public Page at {string}', async (url: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Navigate.to(url)
    );
});

When('the user selects {string} mode', async (modeName: string) => {
    const page = getPage();
    const modeBtn = page.getByRole('button', { name: new RegExp(modeName, 'i') });
    await modeBtn.click();
});

When('the user expands Advanced Pedagogical Controls', async () => {
    const page = getPage();
    const advancedControlsBtn = page.getByText(/Advanced Pedagogical Controls/i);
    await advancedControlsBtn.click();
});

When('the user selects target audience {string} and cognitive level {string}', async (audience: string, level: string) => {
    const page = getPage();

    const targetAudienceSelect = page.locator('select[aria-label="Target Audience"]');
    if (await targetAudienceSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await targetAudienceSelect.selectOption(audience);
    }

    const cognitiveLevelSelect = page.locator('select[aria-label="Bloom\'s Cognitive Level"]');
    if (await cognitiveLevelSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cognitiveLevelSelect.selectOption(level);
    }
});

When('the user selects or enters topic {string}', async (topicName: string) => {
    const page = getPage();
    const topicBtn = page.getByRole('button', { name: new RegExp(topicName, 'i') });
    if (await topicBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await topicBtn.click();
    } else {
        const topicInput = page.locator('input[placeholder*="History of Rome"]');
        if (await topicInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await topicInput.fill(topicName);
        }
    }
});

When('the user switches to {string} mode', async (modeName: string) => {
    const page = getPage();
    const modeBtn = page.getByRole('button', { name: new RegExp(modeName, 'i') });
    await modeBtn.click();
});

When('the user clicks sample material button {string}', async (sampleName: string) => {
    const page = getPage();
    const btn = page.getByRole('button', { name: new RegExp(sampleName, 'i') });
    await btn.click();
});

When('the user clicks the {string} button', async (buttonText: string) => {
    const page = getPage();
    if (buttonText.includes('Extract & Generate')) {
        const generateBtn = page.locator('#btn-generate-questions');
        await generateBtn.click();
    } else {
        const btn = page.getByRole('button', { name: new RegExp(buttonText, 'i') });
        await btn.click();
    }
});

Then('the generated questions results section should be displayed', async () => {
    const page = getPage();
    const resultsHeader = page.getByText(/AI Engine Generation Complete|Analyzing document|Analyzing and extracting questions|Questions/i).first();
    await resultsHeader.waitFor({ state: 'visible', timeout: 60000 });
});
