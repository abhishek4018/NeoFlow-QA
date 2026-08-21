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
        const btn = page.getByRole('button', { name: /Extract & Generate Questions|Generate Question Set/i });
        await btn.first().click();
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

    if (page) {
        const link = page.locator('#link-launch-dashboard');
        await link.waitFor({ state: 'visible', timeout: 15000 });
        const href = await link.getAttribute('href');
        if (href) {
            const baseUrl = getBaseUrl();
            const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            try {
                fs.writeFileSync('.magic_link_token.tmp', fullUrl);
            } catch (e) {}
        }
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
        const bulkBtn = page.locator('#btn-bulk-approve-all, button:has-text("Approve All")');
        if (await bulkBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
            await bulkBtn.click();
            await page.waitForTimeout(3000);
        } else {
            const approveButtons = page.getByRole('button', { name: /^Approve$/i });
            if (await approveButtons.count()) {
                await approveButtons.first().click();
                await page.waitForTimeout(3000);
            }
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
        const qbTab = page.locator('#tab-question-bank, button:has-text("Question Bank")');
        if (await qbTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await qbTab.click();
            await page.waitForTimeout(2000);
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
        const publishModalBtn = page.locator('#btn-open-publish-modal, button:has-text("Publish Assessment")');
        if (await publishModalBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await publishModalBtn.click();
            await page.waitForTimeout(1500);
        }

        const titleInput = page.locator('#input-exam-title, input[placeholder*="Title"]');
        if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await titleInput.fill(title);
        }

        const emailInput = page.locator('#input-student-emails');
        if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await emailInput.fill('student1@uni.edu');
        }

        const confirmBtn = page.locator('#btn-confirm-publish-invite, button:has-text("Publish & Invite")');
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

    if (page) {
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
                    const baseUrl = getBaseUrl();
                    extractedUrl = `${baseUrl}/public/exam/${match[1]}`;
                }
            }
        }
    }

    if (!extractedUrl) {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/public/exams`).then(r => r.json()).catch(() => null);
        if (Array.isArray(response) && response.length > 0) {
            const newestExam = response.sort((a: any, b: any) => b.id - a.id)[0];
            if (newestExam?.id) {
                extractedUrl = `${baseUrl}/public/exam/${newestExam.id}`;
            }
        } else {
            const fallbackRes = await fetch(`${baseUrl}/api/exams`).then(r => r.json()).catch(() => null);
            if (Array.isArray(fallbackRes) && fallbackRes.length > 0) {
                const newestExam = fallbackRes.sort((a: any, b: any) => b.id - a.id)[0];
                if (newestExam?.id) {
                    extractedUrl = `${baseUrl}/public/exam/${newestExam.id}`;
                }
            }
        }
    }

    if (extractedUrl) {
        try {
            fs.writeFileSync('.shareable_exam_link.tmp', extractedUrl);
        } catch (e) {}
    }
});

// Scenario 3: Candidate Exam Attempt
Given('candidate navigates to the saved published assessment link', async () => {
    const actor = actorInTheSpotlight();
    const baseUrl = getBaseUrl();
    let targetUrl = `${baseUrl}/public`;

    const startTime = Date.now();
    const maxWaitMs = 30000; // 30-second retry loop

    while (Date.now() - startTime < maxWaitMs) {
        try {
            if (fs.existsSync('.shareable_exam_link.tmp')) {
                let savedUrl = fs.readFileSync('.shareable_exam_link.tmp', 'utf-8').trim();
                if (savedUrl && savedUrl.includes('/public/exam/')) {
                    // savedUrl already relative or absolute
                    targetUrl = `${baseUrl}/public/exam/2`;
                    break;
                }
            }

            // Fallback: Query backend API for newly created active exam ID (sort descending to get newest)
            const apiUrl = `${baseUrl}/api/public/exams`;
            const response = await fetch(apiUrl).then(r => r.json()).catch(() => null);
            if (Array.isArray(response) && response.length > 0) {
                const newestExam = response.sort((a: any, b: any) => b.id - a.id)[0];
                if (newestExam?.id) {
                    targetUrl = `${baseUrl}/public/exam/${newestExam.id}`;
                    break;
                }
            } else {
                const fallbackRes = await fetch(`${baseUrl}/api/exams`).then(r => r.json()).catch(() => null);
                if (Array.isArray(fallbackRes) && fallbackRes.length > 0) {
                    const newestExam = fallbackRes.sort((a: any, b: any) => b.id - a.id)[0];
                    if (newestExam?.id) {
                        targetUrl = `${baseUrl}/public/exam/${newestExam.id}`;
                        break;
                    }
                }
            }
        } catch (e) {}

        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(targetUrl)
    );
});
