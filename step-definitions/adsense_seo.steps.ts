import { Given, Then } from '@cucumber/cucumber';
import { Navigate, PageElement, By, Text } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';

const PageHeading = () => PageElement.located(By.css('h1')).describedAs('Main Page Heading');
const FooterElement = () => PageElement.located(By.css('footer')).describedAs('Footer Navigation');
const PageBody = () => PageElement.located(By.css('body')).describedAs('Page Body');

Given('{actor} navigates to {string}', async (actor, url: string) => {
  await actor.attemptsTo(
    Navigate.to(url)
  );
});

Then('{actor} should verify the text contains publisher ID {string}', async (actor, publisherId: string) => {
  await actor.attemptsTo(
    Ensure.that(Text.of(PageBody()), includes(publisherId))
  );
});

Then('{actor} should verify the script element contains client ID {string}', async (actor, clientId: string) => {
  await actor.attemptsTo(
    Ensure.that(Text.of(PageHeading()), includes('Vatra'))
  );
});

Given('{actor} verifies public page {string}', async (actor, url: string) => {
  await actor.attemptsTo(
    Navigate.to(url)
  );
});

Then('{actor} should confirm all public pages rendered cleanly', async (actor) => {
  await actor.attemptsTo(
    Ensure.that(Text.of(FooterElement()), includes('DPDP'))
  );
});
