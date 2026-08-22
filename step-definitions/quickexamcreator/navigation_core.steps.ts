import { Then,When } from '@cucumber/cucumber';
import { Ensure, includes, isPresent } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, Click, Page, PageElement } from '@serenity-js/web';

Then('the header with text {string} should be visible', async (text: string) => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(
            PageElement.located(By.xpath(`//h1[contains(., '${text}')]`)),
            isPresent()
        )
    );
});

When('the user navigates to the {string} page from navigation bar', async (pageName: string) => {
    await actorInTheSpotlight().attemptsTo(
        Click.on(
            PageElement.located(By.xpath(`//nav//a[normalize-space()='${pageName}']`))
        )
    );
});

Then('the page url should contain {string}', async (expectedPath: string) => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(
            Page.current().url().href,
            includes(expectedPath)
        )
    );
});

Then('the main heading should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(
            PageElement.located(By.xpath('//h1 | //h2')),
            isPresent()
        )
    );
});

Then('the contact content should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(
            PageElement.located(By.xpath('//h1 | //h2 | //form')),
            isPresent()
        )
    );
});
