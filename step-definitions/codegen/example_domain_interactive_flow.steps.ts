import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { By, Enter, isVisible, PageElement, Text } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

// Page Elements for Example Domain
const MainContainer = () => PageElement.located(By.css('body')).describedAs('Main Page Body');

// Custom steps generated for example_domain_interactive_flow
Given('the user verifies the example_domain_interactive_flow is active', async () => {
    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(MainContainer(), isVisible()),
        Ensure.that(Text.of(MainContainer()), includes(''))
    );
});
