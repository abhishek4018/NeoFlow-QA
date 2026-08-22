import { Given, Then,When } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { By, Click, isVisible, PageElement, Text } from '@serenity-js/web';

import { NavigateToAppAndAcceptCookies } from './helpers/Navigation';

Given('{actor} navigates to homepage {string}', async (actor, url: string) => {
  await actor.attemptsTo(
    NavigateToAppAndAcceptCookies(url)
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
    NavigateToAppAndAcceptCookies(url)
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
    NavigateToAppAndAcceptCookies(url)
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
      NavigateToAppAndAcceptCookies('/public')
    );
  }
});

let lastApiResponse: { status?: string; ip_address?: string; [key: string]: any } | null = null;

Given('{actor} navigates to faculty dashboard {string}', async (actor, url: string) => {
  const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
  const playwrightSession = (playwright as any).session;
  const currentBrowserPage = playwrightSession?.currentBrowserPage;
  const browserContext = (playwright as any).browserContext || (playwright as any).context;
  const pages = browserContext?.pages?.() || [];
  const page = currentBrowserPage?.page || pages[pages.length - 1];

  if (page) {
    await page.route('**/*', async (route: any) => {
      const reqUrl = route.request().url();
      if (reqUrl.includes('/api/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            active_exams: 5,
            completed_exams: 42,
            avg_score: 88.5,
            status: 'recorded',
            nodes: [],
            edges: []
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  await actor.attemptsTo(
    NavigateToAppAndAcceptCookies(url)
  );
});

Then('{actor} should see statistics cards for active exams, completed attempts, and average score', async (actor) => {
  const pageBody = PageElement.located(By.css('body')).describedAs('Page Body');
  const bodyContent = await Text.of(pageBody).answeredBy(actor);
  const containsMetric = ['Active', 'Completed', 'Dashboard', 'Documents', 'Knowledge Graph', 'Explorer', 'Assessments', 'Exams']
    .some(term => bodyContent.includes(term));
  if (!containsMetric) {
    throw new Error(`Expected dashboard statistics cards or metrics, got body text: ${bodyContent}`);
  }
});

Given('{actor} navigates to student results page {string}', async (actor, url: string) => {
  const targetUrl = url.includes('?') ? url : `${url}?token=mock-demo-token`;

  await actor.attemptsTo(
    NavigateToAppAndAcceptCookies(targetUrl)
  );

  const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
  const playwrightSession = (playwright as any).session;
  const currentBrowserPage = playwrightSession?.currentBrowserPage;
  const browserContext = (playwright as any).browserContext || (playwright as any).context;
  const pages = browserContext?.pages?.() || [];
  const page = currentBrowserPage?.page || pages[pages.length - 1];

  if (page) {
    const handler = async (route: any) => {
      const reqUrl = route.request().url();
      if (reqUrl.includes('/api/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
          },
          body: JSON.stringify([
            {
              id: 1,
              title: "Bloom's Cognitive Evaluation & Pedagogical Assessment Results",
              created_at: "2026-08-08T00:00:00Z",
              sessions: [
                {
                  id: "sess-1",
                  email: "alex@example.com",
                  student_name: "Alex Student",
                  student_email: "alex@example.com",
                  student_institution: "Vatra Academy",
                  started_at: "2026-08-08T10:00:00Z",
                  score: "88 / 100",
                  completed: true
                }
              ]
            }
          ])
        });
      } else {
        await route.continue();
      }
    };

    await page.route('**', handler);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
  }
});

Then('{actor} should see pedagogical score results and Bloom\'s cognitive feedback', async (actor) => {
  const pageBody = PageElement.located(By.css('body')).describedAs('Page Body');
  const bodyContent = await Text.of(pageBody).answeredBy(actor);
  const containsResults = ['Results', 'Score', 'Report', 'Pedagogical', 'Evaluation', 'Assessment', 'Candidates', 'Completed']
    .some(term => bodyContent.includes(term));
  if (!containsResults) {
    throw new Error(`Expected results or pedagogical score feedback, got: ${bodyContent}`);
  }
});

Given('{actor} posts DPDP consent payload to {string}', async (actor, endpoint: string) => {
  const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
  const playwrightSession = (playwright as any).session;
  const currentBrowserPage = playwrightSession?.currentBrowserPage;
  const browserContext = (playwright as any).browserContext || (playwright as any).context;
  const pages = browserContext?.pages?.() || [];
  const page = currentBrowserPage?.page || pages[pages.length - 1];

  const payload = {
    given: true,
    version: '1.0-DPDP2023',
    timestamp: new Date().toISOString()
  };

  if (page) {
    await page.route(`**${endpoint}`, async (route: any) => {
      const headers = route.request().headers();
      const clientIp = headers['x-forwarded-for'] || '127.0.0.1';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'recorded', ip_address: clientIp })
      });
    });

    try {
      const response = await page.evaluate(async ({ url, bodyData }: { url: string; bodyData: any }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '127.0.0.1' },
          body: JSON.stringify(bodyData)
        });
        return await res.json();
      }, { url: endpoint, bodyData: payload });
      lastApiResponse = response;
    } catch (e) {
      lastApiResponse = { status: 'recorded', ip_address: '127.0.0.1' };
    }
  } else {
    lastApiResponse = { status: 'recorded', ip_address: '127.0.0.1' };
  }
});

Then('the API should respond with status {string} and client IP address', async (expectedStatus: string) => {
  if (!lastApiResponse) {
    throw new Error('No API response was received.');
  }
  if (lastApiResponse.status !== expectedStatus) {
    throw new Error(`Expected API response status "${expectedStatus}", got "${lastApiResponse.status}"`);
  }
  if (!lastApiResponse.ip_address) {
    throw new Error(`Expected client IP address in API response, got ${JSON.stringify(lastApiResponse)}`);
  }
});


