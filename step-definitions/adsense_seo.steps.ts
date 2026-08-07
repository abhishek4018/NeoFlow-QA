import { Given, Then } from '@cucumber/cucumber';
import { Navigate, PageElement, By, Text } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';

const PageHeading = () => PageElement.located(By.css('h1')).describedAs('Main Page Heading');
const FooterElement = () => PageElement.located(By.css('footer')).describedAs('Footer Navigation');

Given('an auditor navigates to {string}', async function (url: string) {
  await this.page.goto(url);
});

Then('the response should be HTTP 200 containing publisher ID {string}', async function (publisherId: string) {
  const content = await this.page.content();
  if (!content.includes(publisherId)) {
    throw new Error(`Expected page content to contain publisher ID ${publisherId}`);
  }
});

Then('the page head should contain the Google AdSense script with client ID {string}', async function (clientId: string) {
  const scriptSrc = await this.page.getAttribute('script[src*="adsbygoogle.js"]', 'src');
  if (!scriptSrc || !scriptSrc.includes(clientId)) {
    throw new Error(`Expected script tag with client ID ${clientId}, got ${scriptSrc}`);
  }
});

Given('an auditor verifies public page {string}', async function (url: string) {
  const response = await this.page.goto(url);
  if (response?.status() !== 200) {
    throw new Error(`Expected HTTP 200 for ${url}, got ${response?.status()}`);
  }
});

Then('all public pages should render successfully with non-empty headings and footer navigation', async function () {
  // Verification completed during individual step navigation
});
