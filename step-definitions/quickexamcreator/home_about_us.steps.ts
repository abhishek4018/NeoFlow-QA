import { Then, When } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { actorInTheSpotlight } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';

When('the user clicks the primary navigation link for About Us', async () => {
    await actorInTheSpotlight().attemptsTo(
        ClickWhenReady(PageElement.located(By.xpath('//a[contains(normalize-space(), "About Us") or contains(normalize-space(), "About")]')))
    );
});

Then('the main heading for About Us should be visible', async () => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.eventually(PageElement.located(By.css('h1')), isVisible())
    );
});


