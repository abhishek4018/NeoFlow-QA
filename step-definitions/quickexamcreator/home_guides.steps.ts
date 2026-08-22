import { Then, When } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';


When('the user clicks on "Guides"', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="Guides"]')))
    );
});


When('the user clicks on "ASSESS"', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="Guides"]')))
    );
});


Then('the page title should be "Vatra Assess | Education Intelligence & Assessment Platform"', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1')), isVisible())
    );
});

