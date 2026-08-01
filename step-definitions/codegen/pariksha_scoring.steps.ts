import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { Navigate, Click, Enter, PageElement, By, isVisible, isEnabled, Text } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

// Serenity/JS Page Elements using explicit By locators
const CandidateFirstNameInput = () => PageElement.located(By.id('firstName')).describedAs('Candidate First Name input');
const StartAssessmentButton = () => PageElement.located(By.id('btn-start-assessment')).describedAs('Start Assessment button');
const ConfirmSubmitAssessmentButton = () => PageElement.located(By.id('btn-confirm-submit-assessment')).describedAs('Finalize & Submit Assessment button');
const ResultsHeading = () => PageElement.located(By.xpath("//*[contains(text(),'Pedagogical Review') or contains(text(),'Results Summary')]")).describedAs('Pedagogical Results heading');

Given('candidate navigates to the public exam at {string}', async (url: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Navigate.to(url)
    );
});

When('candidate registers with first name {string}', async (firstName: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(CandidateFirstNameInput(), isVisible()),
        Enter.theValue(firstName).into(CandidateFirstNameInput()),
        Wait.upTo(Duration.ofSeconds(5)).until(StartAssessmentButton(), isEnabled()),
        Click.on(StartAssessmentButton())
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

    let hasMoreQuestions = true;
    let safetyCounter = 0;

    while (hasMoreQuestions && safetyCounter < 15) {
        safetyCounter++;

        await page.waitForTimeout(500);

        const options = page.locator('label');
        const optionCount = await options.count();

        if (optionCount > 0) {
            await options.first().click();
        } else {
            const textInput = page.locator('input[type="text"], input[type="number"], textarea').first();
            if (await textInput.isVisible({ timeout: 1000 }).catch(() => false)) {
                const inputType = await textInput.getAttribute('type');
                if (inputType === 'number') {
                    await textInput.fill('7');
                } else {
                    await textInput.fill('Sample Answer');
                }
            }
        }

        const reviewBtn = page.getByRole('button', { name: /Review & Finalize/i });
        const nextBtn = page.getByRole('button', { name: /^Next$/i });

        if (await reviewBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await reviewBtn.click();
            hasMoreQuestions = false;
        } else if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await nextBtn.click();
        } else {
            hasMoreQuestions = false;
        }
    }
});

When('candidate confirms submission in the pre-submission decision modal', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(ConfirmSubmitAssessmentButton(), isVisible()),
        Click.on(ConfirmSubmitAssessmentButton())
    );
});

Then('candidate should see the student pedagogical results view', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(ResultsHeading(), isVisible()),
        Ensure.that(Text.of(ResultsHeading()), includes('Pedagogical'))
    );
});
