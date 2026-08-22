import { Given, Then } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, Navigate, PageElement } from '@serenity-js/web';


Then('the main heading for guides should be visible with title "Vatra Assess | Intelligence Infrastructure for Education"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, h3, header, main, nav, a, button')), isVisible())
    );
});

Given('the user clicks the primary navigation link for guides', async () => {
    await actorInTheSpotlight().attemptsTo(
        Navigate.to('https://quickexamcreator.com/guides')
    );
});

Then('the main heading for guides should be visible with title "Vatra Assess | Intelligence Infrastructure for Edu"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, h3, header, main, nav, a, button')), isVisible())
    );
});
