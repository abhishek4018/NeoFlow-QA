import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import { By, Click, isVisible, Navigate, PageElement } from '@serenity-js/web';

Given('the user navigates to the home page', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/')
    );
});

Then('the main hero heading should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.xpath('//h1')), isVisible())
    );
});

When('the user clicks on the Assess link', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//nav//a[normalize-space()="Home"]')))
    );
});