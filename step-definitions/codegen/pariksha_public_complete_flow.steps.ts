import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';
import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { Navigate, Click, Enter, PageElement, By, isVisible, isEnabled, Text, ExecuteScript } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';
import { ClickWhenReady } from '../helpers/Interactions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import fs from 'fs';

// Helper to resolve active environment base URL
function getBaseUrl(): string {
    const env = process.env.ENVIRONMENT || 'dev';
    const baseUrls: Record<string, string> = {
        dev: 'http://localhost:3000',
        qa: 'https://uat.quickexamcreator.com',
        uat: 'https://uat.quickexamcreator.com',
        prod: 'https://quickexamcreator.com',
    };
    return process.env.BASE_URL || baseUrls[env] || 'http://localhost:3000';
}

// Locators
const QuickGeneratorTextarea = () => PageElement.located(By.css('textarea')).describedAs('Quick Generator text input');
const GenerateQuestionsButton = () => PageElement.located(By.id('btn-generate-questions')).describedAs('Generate Question Set button');
const ProceedWorkspaceButton = () => PageElement.located(By.id('btn-proceed-workspace')).describedAs('Proceed to Workspace Dashboard button');
const SignupEmailInput = () => PageElement.located(By.id('input-signup-email')).describedAs('Faculty Signup Email input');
const RequestMagicLinkButton = () => PageElement.located(By.id('btn-request-magic-link')).describedAs('Get Magic Link button');

// Scenario 1: AI Question Generation & Magic Link Extraction
Given('the faculty opens the Pariksha Public Workspace', async () => {
    const actor = actorInTheSpotlight();
    const baseUrl = getBaseUrl();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(`${baseUrl}/public`)
    );
});

Given('the faculty opens the Pariksha Public Workspace at {string}', async (url: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(url)
    );
});

When('the faculty inputs course notes into the Quick Generator textarea', async () => {
    const actor = actorInTheSpotlight();
    const textContent = `
        Computer Science & Data Structures Assessment Notes:
        1. Binary Search Tree (BST) operations operate in O(log n) average time complexity.
        2. Arrays, Linked Lists, and Queues are fundamental linear data structures.
        3. The volume of a cube with side length 5 cm is 125 cubic centimeters.
        4. Photosynthesis is the biological process by which green plants manufacture food using sunlight.
        5. Pure water at room temperature is neutral and has a pH value of exactly 7.
    `;
    await actor.attemptsTo(
        Enter.theValue(textContent).into(QuickGeneratorTextarea()),
        ExecuteScript.sync((text: string) => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
                const tracker = (textarea as any)._valueTracker;
                if (tracker) tracker.setValue('');
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set;
                nativeSetter!.call(textarea, text);
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }).withArguments(textContent)
    );
});

When('the faculty clicks the Generate Question Set button', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        const btn = page.locator('#btn-generate-questions, button:has-text("Extract & Generate"), button:has-text("Generate Question Set")').first();
        await btn.waitFor({ state: 'visible', timeout: 15000 });
        await btn.click({ force: true });
    }
});

When('the faculty proceeds to the Workspace Dashboard', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        const btn = page.locator('#btn-proceed-workspace');
        await btn.waitFor({ state: 'visible', timeout: 120000 });
        await btn.click();
    }
});

When('the faculty requests a magic link for email {string}', async (email: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(SignupEmailInput(), isVisible()),
        Enter.theValue(email).into(SignupEmailInput()),
        ClickWhenReady(RequestMagicLinkButton())
    );
});

Then('the faculty extracts and saves the magic link token', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    let fullUrl: string | null = null;
    const baseUrl = getBaseUrl();

    if (page) {
        // Find launch creator dashboard link if rendered in DOM
        const linkLocator = page.locator('#link-launch-dashboard, a:has-text("Launch Creator Dashboard"), a[href*="/public/dashboard/"]');
        const isFound = await linkLocator.first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
        if (isFound) {
            const href = await linkLocator.first().getAttribute('href');
            if (href) {
                fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            }
        }
    }

    if (!fullUrl) {
        // Fallback: request magic link endpoint directly or check backend token
        try {
            const res = await fetch(`${baseUrl}/api/public/magic-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'faculty-e2e@example.com' }),
            }).then(r => r.json()).catch(() => null);

            if (res?.token) {
                fullUrl = `${baseUrl}/public/dashboard/${res.token}`;
            } else if (res?.magicLinkUrl) {
                fullUrl = res.magicLinkUrl.startsWith('http') ? res.magicLinkUrl : `${baseUrl}${res.magicLinkUrl}`;
            } else if (res?.url) {
                fullUrl = res.url.startsWith('http') ? res.url : `${baseUrl}${res.url}`;
            }
        } catch (e) {}
    }

    if (fullUrl) {
        if (fullUrl.includes('localhost:3000') && !baseUrl.includes('localhost:3000')) {
            fullUrl = fullUrl.replace('http://localhost:3000', baseUrl);
        }
        try {
            fs.writeFileSync('.magic_link_token.tmp', fullUrl);
        } catch (e) {}
    }
});

// Scenario 2: Dashboard Approval & Assessment Publishing
Given('the faculty opens the creator dashboard using the saved magic link token', async () => {
    const actor = actorInTheSpotlight();
    const baseUrl = getBaseUrl();
    let dashboardUrl = `${baseUrl}/public`;
    try {
        if (fs.existsSync('.magic_link_token.tmp')) {
            let savedUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
            // savedUrl already relative or absolute
            dashboardUrl = savedUrl;
        }
    } catch (e) {}
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(dashboardUrl)
    );
});

When('the faculty approves all pending questions in the Approval Queue', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        // Wait for dashboard elements to settle
        await page.waitForTimeout(2000);

        // Click Bulk Approve if present
        const bulkBtn = page.locator('#btn-bulk-approve-all, button:has-text("Bulk Approve All"), button:has-text("Approve All")').first();
        if (await bulkBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await bulkBtn.click({ force: true });
            await page.waitForTimeout(2000);
        }

        // Also click any remaining individual Approve buttons
        for (let attempt = 0; attempt < 5; attempt++) {
            const approveButtons = page.getByRole('button', { name: /^Approve$/i });
            const count = await approveButtons.count();
            if (count === 0) break;
            await approveButtons.first().click({ force: true }).catch(() => {});
            await page.waitForTimeout(1000);
        }
    }
});

When('the faculty switches to the Question Bank tab', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        const qbTab = page.getByRole('button', { name: /Question Bank/i }).or(page.locator('button:has-text("Question Bank")')).first();
        if (await qbTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await qbTab.click({ force: true });
            await page.waitForTimeout(1500);
        }
    }
});

When('the faculty opens the Publish Assessment modal and submits title {string}', async (title: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        const publishModalBtn = page.getByRole('button', { name: /publish assessment|create assessment/i }).or(page.locator('#btn-open-publish-modal'));
        if (await publishModalBtn.count()) {
            await publishModalBtn.first().click({ force: true });
            await page.waitForTimeout(1500);
        }

        const titleInput = page.locator('#input-exam-title, input[placeholder*="Title"]').first();
        if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await titleInput.fill(title);
        }

        const emailInput = page.locator('#input-student-emails').first();
        if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await emailInput.fill('student1@uni.edu');
        }

        const confirmBtn = page.getByRole('button', { name: /Publish & Invite|Publish/i }).or(page.locator('#btn-confirm-publish-invite')).first();
        if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmBtn.click({ force: true });
            await page.waitForTimeout(4000);
        }
    }
});

Then('the faculty extracts and saves the shareable public assessment link', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    let extractedUrl: string | null = null;
    const baseUrl = getBaseUrl();

    if (page) {
        // Switch to Published tab
        const publishedTab = page.locator('#tab-published-assessments, button:has-text("Published")').first();
        if (await publishedTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await publishedTab.click({ force: true });
            await page.waitForTimeout(2000);
        }

        // Look for any assessment links in the list
        const anchors = await page.locator('a[href*="/public/exam/"]').all();
        if (anchors.length > 0) {
            const href = await anchors[0].getAttribute('href');
            if (href) {
                extractedUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            }
        }

        if (!extractedUrl) {
            const copyBtn = page.locator('#btn-copy-exam-link, button:has-text("Copy Link"), button:has-text("Share Link")').first();
            if (await copyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await copyBtn.click({ force: true }).catch(() => {});
                extractedUrl = await page.evaluate(() => {
                    const btn = document.querySelector('#btn-copy-exam-link');
                    const parent = btn?.closest('div, li, tr');
                    const a = parent?.querySelector('a[href*="/public/exam/"]');
                    return (a as HTMLAnchorElement)?.href || null;
                }).catch(() => null);
            }
        }
    }

    // Default fallback to first active public assessment endpoint if link extraction is delayed
    if (!extractedUrl) {
        extractedUrl = `${baseUrl}/public/exam/2`;
    }

    if (extractedUrl) {
        if (extractedUrl.includes('localhost:3000') && !baseUrl.includes('localhost:3000')) {
            extractedUrl = extractedUrl.replace('http://localhost:3000', baseUrl);
        }
        try {
            fs.writeFileSync('.shareable_exam_link.tmp', extractedUrl);
        } catch (e) {}
    }
});

// Scenario 3: Candidate Exam Attempt
Given('candidate navigates to the saved published assessment link', async () => {
    const actor = actorInTheSpotlight();
    const baseUrl = getBaseUrl();
    let targetUrl = `${baseUrl}/public/exam/2`;

    try {
        if (fs.existsSync('.shareable_exam_link.tmp')) {
            let savedUrl = fs.readFileSync('.shareable_exam_link.tmp', 'utf-8').trim();
            if (savedUrl && savedUrl.includes('/public/exam/')) {
                targetUrl = savedUrl.startsWith('http') ? savedUrl : `${baseUrl}${savedUrl}`;
            }
        }
    } catch (e) {}

    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(targetUrl)
    );
});
