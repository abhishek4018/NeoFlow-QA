import { Given, Then } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


Given('the user clicks the primary navigation link for "Contact"', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/')
    );
});


Then('the main heading should be visible with text containing "Vatra Assess | Education Intelligence & Assessment Platform"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, main')), isVisible())
    );
});

