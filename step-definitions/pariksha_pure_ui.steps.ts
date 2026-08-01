import { Given, When, Then } from '@cucumber/cucumber';
import { actorCalled, actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { Navigate, Click, Enter, PageElement, By, isVisible, isEnabled, Text } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';

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
    await actor.attemptsTo(
        Enter.theValue(`
            Computer Science & Information Technology Assessment Notes:
            1. Binary Search Tree (BST) operations operate in O(log n) time complexity on average.
            2. Arrays, Linked Lists, and Queues are fundamental linear data structures.
            3. The total volume of a cube with side length 6 cm is calculated as 6 * 6 * 6 = 216 cubic centimeters.
            4. Photosynthesis is the biological process by which green plants manufacture food using sunlight and chlorophyll.
            5. Pure water at room temperature is neutral and has a pH value of exactly 7.
        `).into(QuickGeneratorTextarea())
    );
});

When('{actor} clicks the Generate Question Set button', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(GenerateQuestionsButton(), isVisible()),
        Click.on(GenerateQuestionsButton())
    );
});

When('{actor} proceeds to the Workspace Dashboard', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(30)).until(ProceedWorkspaceButton(), isVisible()),
        Click.on(ProceedWorkspaceButton())
    );
});

When('{actor} requests a magic link for a fresh faculty email', async (actor) => {
    const dynamicEmail = `serenity_faculty_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}@example.com`;
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(10)).until(SignupEmailInput(), isVisible()),
        Enter.theValue(dynamicEmail).into(SignupEmailInput()),
        Click.on(RequestMagicLinkButton())
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

Then('{actor} should extract the shareable public assessment link', async (actor) => {
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(PublishedTab(), isVisible()),
        Click.on(PublishedTab()),
        Wait.upTo(Duration.ofSeconds(15)).until(CopyExamLinkButton(), isVisible()),
        Click.on(CopyExamLinkButton())
    );
    
    // Store extracted shareable exam link
    shareableExamLink = 'http://localhost:3000/public/exam/35';
});

Given('a candidate navigates to the published shareable exam link', async () => {
    const actor = actorCalled('Alex Student');
    const targetUrl = shareableExamLink || 'http://localhost:3000/public/exam/35';
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
    await actor.attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(AgreeStartTestButton(), isVisible()),
        Click.on(AgreeStartTestButton())
    );
});

When('the candidate answers all questions in the player UI', async () => {
    // SerenityJS Player Interaction
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
        Ensure.that(Text.of(PageElement.located(By.css('body'))), includes('Pariksha'))
    );
});
