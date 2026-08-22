import { Given, Then } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement, Text } from '@serenity-js/web';

import { waitForElementWithXPath } from '../../test/utils';
import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';




Given('the user navigates to the Happiest Health homepage', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('')
    );
});

Then('the page title should be {string}', async (expectedTitle: string) => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(Text.of(PageElement.located(By.css('title'))), equals(expectedTitle))
    );
});

Then('the logo should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(waitForElementWithXPath('(//a[@href="/"])[1]', 15),
        Ensure.that(PageElement.located(By.xpath('(//a[@href="/"])[1]')), isVisible())
    );
});

Then('user clicks on the {string} button', async (buttonName: string) => {
    await actorInTheSpotlight().attemptsTo(waitForElementWithXPath('//button[text()="' + buttonName + '"]', 15), ClickWhenReady(PageElement.located(By.xpath('//button[text()="' + buttonName + '"]')))
    );
});