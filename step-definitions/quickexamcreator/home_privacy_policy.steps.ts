import { Given, Then } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Page } from '@serenity-js/web';

import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


Given('the user clicks the primary navigation link for Privacy Policy', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/')
    );
});


Then('the main heading "Vatra Assess | Education Intelligence & Assessment" should be visible in title', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(Page.current().title(), includes('Vatra Assess | Education Intelligence & Assessment'))
    );
});

