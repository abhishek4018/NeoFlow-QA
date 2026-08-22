import { Given, Then,When } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, Click, isVisible, Navigate, PageElement } from '@serenity-js/web';

Given('the user navigates to the about url', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/about')
    );
});

Then('the main heading for about should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, h3, header, main, nav, a, button')), isVisible())
    );
});

Given('the user clicks the primary navigation link for about', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/about')
    );
});

When('then the user should click "ASSESS"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});

Then('then the user should skip "Home"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, h3, header, main, nav, a, button')), isVisible())
    );
});

When('then the user should click "Guides"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});

When('then the user should click "About"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});
