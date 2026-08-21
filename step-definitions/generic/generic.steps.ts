import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';
import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';
import { isVisible } from '@serenity-js/web';
import { Enter, PageElement, By } from '@serenity-js/web';
import { ClickWhenReady } from '../helpers/Interactions';

// Generic steps for common actions

Given('the user navigates to {string}', async (url: string) => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies(url)
    );
});

When('the user enters {string} into the element with aria-label {string}', async (value: string, label: string) => {
    await actorInTheSpotlight().attemptsTo(
        Enter.theValue(value).into(PageElement.located(By.css(`[aria-label="${label}"]`)))
    );
});

When('the user clicks the element with aria-label {string}', async (label: string) => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.css(`[aria-label="${label}"]`)))
    );
});

Then('the text {string} should be visible', async (text: string) => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(PageElement.located(By.xpath(`//*[contains(text(),'${text}')]`)), isVisible())
    );
});