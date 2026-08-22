import { Given, When } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


When('the main heading for "Vatra Assess | Education Intelligence & Assessment" is displayed', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});


Given('the primary navigation link for "ASSESS" should be clickable', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/')
    );
});

