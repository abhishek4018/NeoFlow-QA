import { Then } from '@cucumber/cucumber';
import { Actor, configure, Duration, actorInTheSpotlight } from '@serenity-js/core';
import { Page } from '@serenity-js/web';
import { Ensure, equals } from '@serenity-js/assertions';

configure({
  interactionTimeout: Duration.ofSeconds(60), // Set default timeout to 60 seconds
});

Then('the title should be {string}', async (expectedTitle: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(Page.current().title(), equals(expectedTitle))
  );
});
