import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, Enter, isVisible, PageElement } from '@serenity-js/web';

import { CheckElementPresent, ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

// Generic steps for common actions

Given('the user navigates to {string}', async (url: string) => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies(url)
    );
});

Given('the user navigates to the {word} url', async (pageName: string) => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies(`/${pageName}`)
    );
});

Given('the user navigates to the {string} page', async (pageName: string) => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies(pageName)
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

Then('the following key elements should be visible on the page:', async (dataTable: import('@cucumber/cucumber').DataTable) => {
    const rows = dataTable.hashes();
    for (const row of rows) {
        const identifier = (row['Identifier / Text'] || row['Identifier'] || row['Text'] || '').trim();
        const role = (row['Target Role'] || row['Element Type'] || '').trim();
        if (!identifier) continue;

        await actorInTheSpotlight().attemptsTo(
            CheckElementPresent(role, identifier)
        );
    }
});