import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import { By, Click, isVisible, Navigate, PageElement } from '@serenity-js/web';

Given('the user navigates to the home url', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/')
    );
});

When('the main heading for "Education Intelligence & Assessment" should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});

Given('the user clicks the primary navigation link for "Home"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/')
    );
});
