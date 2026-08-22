import { Given, Then } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


Given('the user clicks the primary navigation link for :string', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/')
    );
});


Then('the main heading with text ":string" should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, main')), isVisible())
    );
});

