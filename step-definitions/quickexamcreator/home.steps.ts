import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, Page, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';


When('the user clicks on "<element_label>"', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[normalize-space()="ASSESS"]')))
    );
});


Then('the main heading for "<heading_text>" should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1, h2, main')), isVisible())
    );
});

