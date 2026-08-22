import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


When('the main heading for privacy should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});


Then('the page title is "Privacy Policy & DPDP | Vatra Assess"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1')), isVisible())
    );
});


Given('the primary navigation link for privacy should be clickable', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/privacy')
    );
});

