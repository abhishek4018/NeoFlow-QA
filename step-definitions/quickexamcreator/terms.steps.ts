import { Given, When } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


Given('the user navigates to the "Terms of Service | Vatra Assess" url', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/terms')
    );
});


When('the main heading for "Terms of Service | Vatra Assess" is visible on the page', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});


Given('the primary navigation link for "Vatra Assess" should be clickable and link to the correct URL', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/terms')
    );
});

