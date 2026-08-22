import { Given, When } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


Given('the user clicks the primary navigation link for <LinkLabel>', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/')
    );
});


When('the main heading for <LinkLabel> should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="About"]')))
    );
});

