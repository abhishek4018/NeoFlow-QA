import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import { By, Click, isVisible, Navigate, PageElement } from '@serenity-js/web';

Given('I am on the guides homepage', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/guides')
    );
});

When('I see "Vatra Assess | Intelligence Infrastructure for Education" on the page', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.xpath('(//h1 | //h2)[1]')), isVisible())
    );
});

Then('I should be able to click on "Guides"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//nav//a[normalize-space()="Guides"]')))
    );
});