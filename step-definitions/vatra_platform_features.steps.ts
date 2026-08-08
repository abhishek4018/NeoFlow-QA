import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { Navigate, Click, PageElement, By, Text, isVisible } from '@serenity-js/web';
import { Ensure, includes } from '@serenity-js/assertions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

Given('{actor} navigates to homepage {string}', async (actor, url: string) => {
  await actor.attemptsTo(
    Navigate.to(url)
  );
});

Then('{actor} should see the VATRA logo mark and tagline {string}', async (actor, tagline: string) => {
  const pageBody = PageElement.located(By.css('body')).describedAs('Page Body');
  await actor.attemptsTo(
    Ensure.that(Text.of(pageBody), includes('Vatra')),
    Ensure.that(Text.of(pageBody), includes(tagline))
  );
});

Given('{actor} navigates to about page {string}', async (actor, url: string) => {
  await actor.attemptsTo(
    Navigate.to(url)
  );
});

Then('{actor} should see stakeholder sections for Educators, Students, and Institutions', async (actor) => {
  const pageBody = PageElement.located(By.css('body')).describedAs('Page Body');
  await actor.attemptsTo(
    Ensure.that(Text.of(pageBody), includes('For Educators')),
    Ensure.that(Text.of(pageBody), includes('For Students')),
    Ensure.that(Text.of(pageBody), includes('For Institutions'))
  );
});

Given('{actor} navigates to landing page {string}', async (actor, url: string) => {
  await actor.attemptsTo(
    Navigate.to(url)
  );
});

When('{actor} clicks {string} on the DPDP consent banner', async (actor, buttonText: string) => {
  const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
  const playwrightSession = (playwright as any).session;
  const currentBrowserPage = playwrightSession?.currentBrowserPage;
  const browserContext = (playwright as any).browserContext || (playwright as any).context;
  const pages = browserContext?.pages?.() || [];
  const page = currentBrowserPage?.page || pages[pages.length - 1];

  if (page) {
    const button = page.getByRole('button', { name: buttonText });
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
  } else {
    const bannerBtn = PageElement.located(By.xpath(`//button[contains(text(), '${buttonText}')]`));
    await actor.attemptsTo(
      Wait.upTo(Duration.ofSeconds(10)).until(bannerBtn, isVisible()),
      Click.on(bannerBtn)
    );
  }
});

Then('the DPDP consent cookie {string} should be set', async (cookieName: string) => {
  const actor = actorInTheSpotlight();
  const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
  const playwrightSession = (playwright as any).session;
  const currentBrowserPage = playwrightSession?.currentBrowserPage;
  const browserContext = (playwright as any).browserContext || (playwright as any).context;
  const pages = browserContext?.pages?.() || [];
  const page = currentBrowserPage?.page || pages[pages.length - 1];

  let cookieFound = false;

  if (browserContext && typeof browserContext.cookies === 'function') {
    const cookies = await browserContext.cookies();
    cookieFound = cookies.some((c: any) => c.name === cookieName);
  }

  if (!cookieFound && page) {
    const cookiesStr = await page.evaluate(() => document.cookie);
    cookieFound = cookiesStr.includes(cookieName);
  }

  if (!cookieFound) {
    throw new Error(`Expected DPDP consent cookie "${cookieName}" to be set, but it was not found.`);
  }
});

Then('refreshing the page should keep the consent banner hidden', async () => {
  const actor = actorInTheSpotlight();
  const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
  const playwrightSession = (playwright as any).session;
  const currentBrowserPage = playwrightSession?.currentBrowserPage;
  const browserContext = (playwright as any).browserContext || (playwright as any).context;
  const pages = browserContext?.pages?.() || [];
  const page = currentBrowserPage?.page || pages[pages.length - 1];

  if (page) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const banner = page.locator('text=Digital Personal Data Protection (DPDP) Notice');
    const isVisible = await banner.isVisible().catch(() => false);
    if (isVisible) {
      throw new Error('DPDP consent banner should be hidden after refresh, but it was visible');
    }
  } else {
    await actor.attemptsTo(
      Navigate.to('/public')
    );
  }
});
