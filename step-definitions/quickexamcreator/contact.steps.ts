import { Given, When } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, Click, PageElement } from '@serenity-js/web';

import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


When('the main heading for contact should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});


When('the contact element should be clickable', async () => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});


Given('the primary navigation link for contact should have the correct email address', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/contact')
    );
});

