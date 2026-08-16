import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';
import { Given, When, Then } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { By, Click, Enter, isVisible, Navigate, PageElement, Text } from '@serenity-js/web';

const Homepage = {
    getStartedButton: () => PageElement.located(By.xpath('(//*[contains(text(),"Get started for free")])[1]')).describedAs('Get started for free button'),
    dashboardLink: () => PageElement.located(By.xpath('(//*[contains(text(),"Dashboard")])[1]')).describedAs('Dashboard link')
};

const DashboardLogin = {
    emailInput: () => PageElement.located(By.css('input[type="email"], input[type="text"]')).describedAs('Email input'),
    openDashboardButton: () => PageElement.located(By.xpath('(//*[contains(text(),"Open Dashboard")])[1]')).describedAs('Open Dashboard button')
};

const Dashboard = {
    welcomeMessage: () => PageElement.located(By.css('body')).describedAs('Dashboard welcome message')
};

Given('I navigate to the quick exam creator homepage', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('https://uat.quickexamcreator.com/')
    );
});

When('I click on {string}', async (buttonText: string) => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath(`(//*[contains(text(),"${buttonText}")])[1]`)))
    );
});

When('I navigate to the {string}', async (linkText: string) => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath(`(//*[contains(text(),"${linkText}")])[1]`)))
    );
});

When('I enter my email {string} and click {string}', async (email: string, buttonText: string) => {
    await actorInTheSpotlight().attemptsTo(
        Enter.theValue(email).into(DashboardLogin.emailInput()),
        Click.on(PageElement.located(By.xpath(`(//*[contains(text(),"${buttonText}")])[1]`)))
    );
});

Then('I should see the assessment dashboard loaded for {string}', async (email: string) => {
    const expectedText = `Review, organize, and deploy your assessment items. Your question bank is automatically saved to your secure session (${email}) and can be re-accessed anytime at /public/dashboard.`;
    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Duration.ofSeconds(30)).until(Text.of(Dashboard.welcomeMessage()), includes(expectedText))
    );
});
