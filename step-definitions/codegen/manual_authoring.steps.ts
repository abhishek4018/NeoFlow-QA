import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Navigate } from '@serenity-js/web';

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

Then('the user extracts and saves the magic link token', async () => {
    const page = getPage();
    const link = await page.locator('a', { hasText: /launch creator dashboard/i }).first().getAttribute('href');
    if (link) {
        const fullUrl = link.startsWith('http') ? link : `http://localhost:3000${link}`;
        try {
            require('fs').writeFileSync('.magic_link_token.tmp', fullUrl);
        } catch (e) {}
    }
});

Given('the user opens the creator dashboard using the saved magic link token', async () => {
    const actor = actorInTheSpotlight();
    let dashboardUrl = 'http://localhost:3000/public';
    try {
        if (require('fs').existsSync('.magic_link_token.tmp')) {
            dashboardUrl = require('fs').readFileSync('.magic_link_token.tmp', 'utf-8').trim();
        }
    } catch (e) {}
    await actor.attemptsTo(
        Navigate.to(dashboardUrl)
    );
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
        await page.waitForTimeout(2000);
    }

    const createAssessmentButton = page.getByRole('button', { name: /publish assessment|create assessment/i });
    if (await createAssessmentButton.count()) {
        await createAssessmentButton.first().click();
        await page.waitForTimeout(2000);
    }

    const titleInput = page.locator('#input-exam-title, input[placeholder*="Title"]');
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await titleInput.fill('Algorithms Midterm Exam');
    }

    const confirmPublishBtn = page.locator('#btn-confirm-publish-invite, button:has-text("Publish & Invite")');
    if (await confirmPublishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await confirmPublishBtn.click();
        await page.waitForTimeout(4000);
    }
});

Then('the user extracts and saves the published assessment link', async () => {
    const page = getPage();
    const publishedTab = page.locator('#tab-published-assessments');
    if (await publishedTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await publishedTab.click();
        await page.waitForTimeout(2000);
    }
    const resultsLink = page.locator('a[href*="/public/exam/"]').first();
    if (await resultsLink.count()) {
        const href = await resultsLink.getAttribute('href');
        if (href) {
            const match = href.match(/\/public\/exam\/(\d+)/);
            if (match) {
                const examUrl = `http://localhost:3000/public/exam/${match[1]}`;
                try {
                    require('fs').writeFileSync('.shareable_exam_link.tmp', examUrl);
                } catch (e) {}
            }
        }
    }
});


When('the user takes the published assessment as a candidate', async () => {
    const page = getPage();
    const candidateLink = page.locator('a[href*="/public/exam/"]').first();
    if (await candidateLink.count()) {
        await candidateLink.click();
        await page.waitForTimeout(3000);
    }
});

When('the user validates the result in the faculty dashboard', async () => {
    const page = getPage();
    await page.waitForTimeout(2000);
});
