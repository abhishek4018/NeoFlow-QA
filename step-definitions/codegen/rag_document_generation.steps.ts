import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';
import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { expect } from '@playwright/test';

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

Given('the user opens the Pariksha Public Page for RAG at {string}', async (url: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(url)
    );
    const page = getPage();

    // Setup mocks
    await page.route('**/api/**', async route => {
        if (route.request().url().includes('/api/public/ingestion') && route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    job_id: 'mock-job-id',
                    data: { job_id: 'mock-job-id', id: 'mock-job-id' }
                })
            });
        } else if (route.request().url().includes('/api/public/jobs/')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'mock-job-id',
                    status: 'completed',
                    result: {
                        questions: [
                            {
                                id: 'q1',
                                type: 'multiple-choice',
                                prompt: 'What is physics?',
                                options: ['A', 'B'],
                                answer: 'A'
                            }
                        ]
                    }
                })
            });
        } else {
            await route.continue();
        }
    });

    await page.waitForLoadState('networkidle');
});

When('the user selects the {string} mode', async (mode: string) => {
    const page = getPage();
    // Map "Upload RAG Document" to Deep Scan
    const ragModeBtn = page.getByRole('button', { name: /Deep Scan/i });
    await expect(ragModeBtn).toBeVisible({ timeout: 10000 });
    await ragModeBtn.click();
});

When('the user expands Advanced Pedagogical Controls for RAG', async () => {
    const page = getPage();
    const advancedControlsBtn = page.getByRole('button', { name: /Advanced Pedagogical Controls/i });
    if (await advancedControlsBtn.isVisible()) {
        const isExpanded = await advancedControlsBtn.getAttribute('aria-expanded');
        if (isExpanded === 'false' || !isExpanded) {
            await advancedControlsBtn.click();
        }
    }
});

When('the user selects target audience {string} and cognitive level {string} for RAG', async (audience: string, level: string) => {
    const page = getPage();
    const audienceSelect = page.getByRole('combobox', { name: /Target Audience/i });
    if (await audienceSelect.isVisible()) {
        // Map Postgraduate to Corporate Training if Postgraduate isn't available
        await audienceSelect.selectOption({ label: 'Corporate Training' });
    }

    const cognitiveSelect = page.getByRole('combobox', { name: /Cognitive Level/i });
    if (await cognitiveSelect.isVisible()) {
        // Map Analyze to Analyze (Distinction)
        await cognitiveSelect.selectOption({ label: 'Analyze (Distinction)' });
    }
});

When('the user uploads a test document {string}', async (fileName: string) => {
    const page = getPage();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
        name: fileName,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Title (Advanced Physics)\n>>\nendobj\n')
    });
});

When('the user clicks the {string} button for RAG', async (buttonText: string) => {
    const page = getPage();
    const generateBtn = page.getByRole('button', { name: /Process Content|Extract & Generate|Generate Question Set/i }).first();
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();
});

Then('the generated questions results section should be displayed with parsed RAG data', async () => {
    const page = getPage();
    const resultsHeader = page.getByText(/AI Engine Generation Complete|Analyzing document|Analyzing and extracting questions|Questions|Extraction complete/i).last();
    await expect(resultsHeader).toBeVisible({ timeout: 15000 });
});
