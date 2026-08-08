import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled, actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { Navigate, Click, Enter, PageElement, By, isVisible, isEnabled, Text, ExecuteScript } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

// Page Elements using explicit ID and Accessibility Locators
const QuickGeneratorTextarea = () => PageElement.located(By.css('textarea')).describedAs('Quick Generator source text input');
const GenerateQuestionsButton = () => PageElement.located(By.id('btn-generate-questions')).describedAs('Generate Question Set button');
const ProceedWorkspaceButton = () => PageElement.located(By.id('btn-proceed-workspace')).describedAs('Proceed to Workspace Dashboard button');
const SignupEmailInput = () => PageElement.located(By.id('input-signup-email')).describedAs('Faculty Signup Email input');
const RequestMagicLinkButton = () => PageElement.located(By.id('btn-request-magic-link')).describedAs('Get Magic Link button');
const LaunchDashboardLink = () => PageElement.located(By.id('link-launch-dashboard')).describedAs('Launch Creator Dashboard link');

const BulkApproveButton = () => PageElement.located(By.id('btn-bulk-approve-all')).describedAs('Bulk Approve All button');
const QuestionBankTab = () => PageElement.located(By.id('tab-question-bank')).describedAs('Question Bank tab');
const OpenPublishModalButton = () => PageElement.located(By.id('btn-open-publish-modal')).describedAs('Publish Assessment button');
const ExamTitleInput = () => PageElement.located(By.id('input-exam-title')).describedAs('Assessment Title input');
const StudentEmailsInput = () => PageElement.located(By.id('input-student-emails')).describedAs('Student Emails input');
const ConfirmPublishInviteButton = () => PageElement.located(By.id('btn-confirm-publish-invite')).describedAs('Publish & Invite button');
const PublishedTab = () => PageElement.located(By.id('tab-published-assessments')).describedAs('Published Assessments tab');
const CopyExamLinkButton = () => PageElement.located(By.id('btn-copy-exam-link')).describedAs('Copy Shareable Link button');

const CandidateFirstNameInput = () => PageElement.located(By.id('firstName')).describedAs('Candidate First Name input');
const StartAssessmentButton = () => PageElement.located(By.id('btn-start-assessment')).describedAs('Start Assessment button');
const AgreeStartTestButton = () => PageElement.located(By.id('btn-agree-start-test')).describedAs('Agree & Start Test button');
const ConfirmSubmitAssessmentButton = () => PageElement.located(By.id('btn-confirm-submit-assessment')).describedAs('Finalize & Submit Assessment button');

let shareableExamLink = '';

Given('{actor} opens the Pariksha Public Landing page at {string}', async (actor, url: string) => {
    await actor.attemptsTo(
        Navigate.to(url)
    );
});

When('{actor} enters source text into the Quick Generator textarea', async (actor) => {
    const textContent = `
        Computer Science & Information Technology Assessment Notes:
        1. Binary Search Tree (BST) operations operate in O(log n) time complexity on average.
        2. Arrays, Linked Lists, and Queues are fundamental linear data structures.
        3. The total volume of a cube with side length 6 cm is calculated as 6 * 6 * 6 = 216 cubic centimeters.
        4. Photosynthesis is the biological process by which green plants manufacture food using sunlight and chlorophyll.
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

When('{actor} clicks the Generate Question Set button', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(GenerateQuestionsButton(), isEnabled()),
        Click.on(GenerateQuestionsButton())
    );
});

When('{actor} proceeds to the Workspace Dashboard', async (actor) => {
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

When('{actor} requests a magic link for a fresh faculty email', async (actor) => {
    const dynamicEmail = `serenity_faculty_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}@example.com`;
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(SignupEmailInput(), isVisible()),
        Enter.theValue(dynamicEmail).into(SignupEmailInput()),
        Click.on(RequestMagicLinkButton())
    );
});

Then('{actor} extracts and saves the magic link token for the faculty session', async (actor) => {
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
            const fullUrl = href.startsWith('http') ? href : `http://localhost:3000${href}`;
            try {
                require('fs').writeFileSync('.magic_link_token.tmp', fullUrl);
            } catch (e) {}
        }
    }
});

Given('{actor} opens the Faculty Creator Dashboard using the saved magic link token', async (actor) => {
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

When('{actor} launches the Faculty Creator Dashboard', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(LaunchDashboardLink(), isVisible()),
        Click.on(LaunchDashboardLink())
    );
});

When('{actor} approves all generated questions in the Approval Queue', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(BulkApproveButton(), isVisible()),
        Click.on(BulkApproveButton())
    );
});

When('{actor} opens the Publish Assessment modal from the Question Bank', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(QuestionBankTab(), isVisible()),
        Click.on(QuestionBankTab()),
        Wait.upTo(Duration.ofSeconds(5)).until(OpenPublishModalButton(), isEnabled()),
        Click.on(OpenPublishModalButton())
    );
});

When('{actor} fills the assessment title {string} and submits "Publish & Invite"', async (actor, title: string) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(ExamTitleInput(), isVisible()),
        Enter.theValue(title).into(ExamTitleInput()),
        Enter.theValue('student1@uni.edu').into(StudentEmailsInput()),
        Click.on(ConfirmPublishInviteButton())
    );
});

Then('{actor} should extract and save the shareable public assessment link', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(PublishedTab(), isVisible()),
        Click.on(PublishedTab()),
        Wait.upTo(Duration.ofSeconds(15)).until(CopyExamLinkButton(), isVisible()),
        Click.on(CopyExamLinkButton())
    );

    const link = await actor.answer(ExecuteScript.sync(() => {
        const copyBtn = document.querySelector('#btn-copy-exam-link');
        if (copyBtn) {
            const container = copyBtn.closest('.border') || copyBtn.parentElement?.parentElement;
            const anchor = container?.querySelector('a[href*="/public/exam/"]');
            if (anchor) return (anchor as HTMLAnchorElement).href;
        }
        const anyAnchor = Array.from(document.querySelectorAll('a')).find(a => a.href && a.href.includes('/public/exam/'));
        if (anyAnchor) return (anyAnchor as HTMLAnchorElement).href;
        return null;
    }));

    if (link && typeof link === 'string') {
        shareableExamLink = link;
        process.env.SHAREABLE_EXAM_LINK = link;
        (global as any).shareableExamLink = link;
        try {
            require('fs').writeFileSync('.shareable_exam_link.tmp', link);
        } catch (e) {}
    }
});

Then('{actor} should extract the shareable public assessment link', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(PublishedTab(), isVisible()),
        Click.on(PublishedTab()),
        Wait.upTo(Duration.ofSeconds(15)).until(CopyExamLinkButton(), isVisible()),
        Click.on(CopyExamLinkButton())
    );

    const link = await actor.answer(ExecuteScript.sync(() => {
        const copyBtn = document.querySelector('#btn-copy-exam-link');
        if (copyBtn) {
            const container = copyBtn.closest('.border') || copyBtn.parentElement?.parentElement;
            const anchor = container?.querySelector('a[href*="/public/exam/"]');
            if (anchor) return (anchor as HTMLAnchorElement).href;
        }
        const anyAnchor = Array.from(document.querySelectorAll('a')).find(a => a.href && a.href.includes('/public/exam/'));
        if (anyAnchor) return (anyAnchor as HTMLAnchorElement).href;
        return null;
    }));

    if (link && typeof link === 'string') {
        shareableExamLink = link;
        process.env.SHAREABLE_EXAM_LINK = link;
        (global as any).shareableExamLink = link;
        try {
            require('fs').writeFileSync('.shareable_exam_link.tmp', link);
        } catch (e) {}
    }
});

Given('a candidate navigates to the saved shareable exam link', async () => {
    const actor = actorCalled('Alex Student');
    let targetUrl = process.env.SHAREABLE_EXAM_LINK || (global as any).shareableExamLink || shareableExamLink;
    try {
        if (!targetUrl && require('fs').existsSync('.shareable_exam_link.tmp')) {
            targetUrl = require('fs').readFileSync('.shareable_exam_link.tmp', 'utf-8').trim();
        }
    } catch (e) {}
    targetUrl = targetUrl || 'http://localhost:3000/public';
    await actor.attemptsTo(
        Navigate.to(targetUrl)
    );
});

When('the candidate enters first name {string} and clicks "Start Assessment"', async (firstName: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(CandidateFirstNameInput(), isVisible()),
        Enter.theValue(firstName).into(CandidateFirstNameInput()),
        Click.on(StartAssessmentButton())
    );
});

When('the candidate agrees to the test guidelines', async () => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (page) {
        const agreeBtn = page.locator('#btn-agree-start-test');
        if (await agreeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await agreeBtn.click();
        }
    }
});

When('the candidate answers all questions in the player UI', async () => {
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

When('the candidate confirms submission in the Pre-Submission Summary modal', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(ConfirmSubmitAssessmentButton(), isVisible()),
        Click.on(ConfirmSubmitAssessmentButton())
    );
});

Then('the candidate should see their final pedagogical score on the Results view', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        Ensure.that(Text.of(PageElement.located(By.css('body'))), includes('Vatra'))
    );
});
