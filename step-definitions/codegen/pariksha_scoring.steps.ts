import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';
import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { Navigate, Click, Enter, PageElement, By, isVisible, isEnabled, Text } from '@serenity-js/web';
import { Ensure, includes, isPresent } from '@serenity-js/assertions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { ClickWhenReady } from '../helpers/Interactions';

// Serenity/JS Page Elements using explicit By locators
const CandidateFirstNameInput = () => PageElement.located(By.id('firstName')).describedAs('Candidate First Name input');
const StartAssessmentButton = () => PageElement.located(By.id('btn-start-assessment')).describedAs('Start Assessment button');
const ConfirmSubmitAssessmentButton = () => PageElement.located(By.id('btn-confirm-submit-assessment')).describedAs('Finalize & Submit Assessment button');
const ResultsHeading = () => PageElement.located(
    By.xpath("//*[contains(text(),'Pedagogical Review') or contains(text(),'Results Summary') or contains(text(),'Assessment Completed') or contains(text(),'Assessment Result') or contains(text(),'Score') or contains(text(),'Completed')]")
).describedAs('Pedagogical Results heading');

Given('candidate navigates to the public exam at {string}', async (url: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies(url)
    );
});

When('candidate registers with first name {string}', async (firstName: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        // If candidate landed on /public or exam catalog, navigate into the first active exam card
        const examCardLink = page.locator('a[href*="/public/exam/"]').first();
        if (await examCardLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await examCardLink.click();
            await page.waitForTimeout(1500);
        }

        const firstNameInput = page.locator('#firstName, input[name="firstName"], input[placeholder*="First Name"], input[placeholder*="Name"]').first();
        if (await firstNameInput.isVisible({ timeout: 15000 }).catch(() => false)) {
            await firstNameInput.fill(firstName);
            const startBtn = page.locator('#btn-start-assessment, button:has-text("Start Assessment")').first();
            if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                await startBtn.click({ force: true });
                return;
            }
        }
    }

    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(20)).until(CandidateFirstNameInput(), isVisible()),
        Enter.theValue(firstName).into(CandidateFirstNameInput()),
        Wait.upTo(Duration.ofSeconds(15)).until(StartAssessmentButton(), isEnabled()),
        ClickWhenReady(StartAssessmentButton())
    );
});

When('candidate proceeds through guidelines if prompted', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        const agreeBtn = page.locator('#btn-agree-start-test');
        if (await agreeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await agreeBtn.click();
        }
    }
});

When('candidate answers all questions of multiple types in the player', async () => {
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

    for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(300);

        // Check if pre-submission summary is open
        const submitModalBtn = page.getByRole('button', { name: /Finalize and Submit Assessment|Finalize & Submit/i });
        if (await submitModalBtn.isVisible({ timeout: 400 }).catch(() => false)) {
            break;
        }

        const reviewBtn = page.getByRole('button', { name: /Review & Finalize/i });
        if (await reviewBtn.isVisible({ timeout: 400 }).catch(() => false)) {
            await reviewBtn.click({ force: true });
            await page.waitForTimeout(600);
            break;
        }

        // Fill current question answer inside player container
        const numInput = page.locator('input[type="number"]:not([disabled])').first();
        const textInput = page.locator('main textarea:not([disabled]), main input[type="text"]:not([disabled]):not(#firstName), textarea:not([disabled])').first();
        const optionBtn = page.locator('button.option-btn, button[class*="choice"], button[class*="option"], label.cursor-pointer').first();

        if (await optionBtn.isVisible({ timeout: 400 }).catch(() => false)) {
            await optionBtn.click({ force: true }).catch(() => {});
        } else if (await numInput.isVisible({ timeout: 300 }).catch(() => false)) {
            await numInput.fill('1947').catch(() => {});
        } else if (await textInput.isVisible({ timeout: 300 }).catch(() => false)) {
            await textInput.fill('Sample Answer').catch(() => {});
        }

        const nextBtn = page.getByRole('button', { name: /^Next$/i });
        if (await nextBtn.isVisible({ timeout: 800 }).catch(() => false)) {
            await nextBtn.click({ force: true });
        } else if (await reviewBtn.isVisible({ timeout: 800 }).catch(() => false)) {
            await reviewBtn.click({ force: true });
            await page.waitForTimeout(600);
            break;
        }
    }
});

When('candidate confirms submission in the pre-submission decision modal', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        // If results view is already reached, return
        const copyResultBtn = page.getByRole('button', { name: /COPY RESULT LINK|RETURN HOME/i });
        if (await copyResultBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            return;
        }

        // If pre-submission modal is not open yet, click Review & Finalize
        const reviewBtn = page.getByRole('button', { name: /Review & Finalize/i });
        if (await reviewBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await reviewBtn.click({ force: true });
            await page.waitForTimeout(600);
        }

        const submitBtn = page.getByRole('button', { name: /Finalize and Submit Assessment|Finalize & Submit/i });
        if (await submitBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
            await submitBtn.click({ force: true });
            await page.waitForTimeout(2000);
        }
    }
});

Then('candidate should see the student pedagogical results view', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        // Verify pedagogical review or result indicators on screen
        const resultsIndicator = page.locator('body').filter({ hasText: /Pedagogical Review|Keep Pushing|Topic Mastery|COPY RESULT LINK|Score/i }).first();
        await resultsIndicator.waitFor({ state: 'visible', timeout: 30000 });
    }
});
