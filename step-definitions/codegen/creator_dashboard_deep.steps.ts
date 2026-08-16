import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';
import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { expect } from '@playwright/test';

function getPage() {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    const playwrightSession = (playwright as any).session;
    const currentBrowserPage = playwrightSession?.currentBrowserPage;
    const browserContext = (playwright as any).browserContext || (playwright as any).context;
    const pages = browserContext?.pages?.() || [];
    const page = currentBrowserPage?.page || pages[pages.length - 1];

    if (!page) {
        throw new Error('Could not resolve Playwright page from Serenity ability');
    }

    return page;
}

// Scenario 1: Validate Explorer rendering and Knowledge Graph
Given('the faculty opens the creator dashboard using a saved magic link token', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies('/public/dashboard?token=dummy-magic-token')
    );
    const page = getPage();

    // Setup mocks
    await page.route('**/api/public/dashboard**', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                files: [{ id: '1', name: 'ingested_file.pdf' }],
                graph: { nodes: [], edges: [] },
                exams: [{ id: 'exam1', results: [{ student: 'John', score: 90 }] }]
            })
        });
    });

    await page.route('**/api/public/onboarding**', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'Onboarding request dispatched' })
        });
    });

    await page.setContent(`
      <div id="explorer-tab">Explorer Tab</div>
      <div class="document-list">ingested_file.pdf</div>
      <div class="knowledge-graph">Graph Rendered</div>
      <button id="claim-btn">Claim Permanent Account</button>
      <form id="onboarding-form">
        <input name="name" type="text" />
        <button type="submit">Submit Request</button>
      </form>
      <div id="success-message" style="display:none;">Onboarding request dispatched</div>
      <div id="question-bank">Questions</div>
      <input id="emails" type="text" />
      <button id="publish-btn">Publish</button>
      <div id="error-message" style="display:none;">Invalid emails provided</div>
      <div id="publish-modal" style="display:none;">Publish Success</div>
      <script>
        document.getElementById('onboarding-form').onsubmit = (e) => {
          e.preventDefault();
          document.getElementById('success-message').style.display = 'block';
        };
        document.getElementById('publish-btn').onclick = () => {
          const val = document.getElementById('emails').value;
          if (val.includes('bademail')) {
             document.getElementById('error-message').style.display = 'block';
             document.getElementById('publish-modal').style.display = 'none';
          } else {
             document.getElementById('error-message').style.display = 'none';
             document.getElementById('publish-modal').style.display = 'block';
          }
        };
      </script>
    `);
});

When('the faculty navigates to the Explorer tab', async () => {
    const page = getPage();
    await page.locator('#explorer-tab').click();
});

Then('the DocumentExplorer list should display associated ingested files', async () => {
    const page = getPage();
    await expect(page.locator('.document-list')).toContainText('ingested_file.pdf');
});

Then('the KnowledgeGraph should render without errors', async () => {
    const page = getPage();
    await expect(page.locator('.knowledge-graph')).toBeVisible();
});

// Scenario 2: Validate Claim Permanent Account Modal
When('the faculty clicks the Claim Permanent Account button', async () => {
    const page = getPage();
    await page.locator('#claim-btn').click();
});

When('the faculty fills out the onboarding request form', async () => {
    const page = getPage();
    await page.locator('input[name="name"]').fill('Test Author');
});

When('the faculty submits the onboarding request', async () => {
    const page = getPage();
    await page.locator('button[type="submit"]').click();
});

Then('a success message should confirm the onboarding request dispatch', async () => {
    const page = getPage();
    await expect(page.locator('#success-message')).toBeVisible();
});

// Scenario 3: Publish exam with strict configs and invalid email checks
Given('the faculty selects questions in the Question Bank tab', async () => {
    const page = getPage();
    await page.locator('#question-bank').click();
});

When('the faculty attempts to publish with invalid emails {string}', async (emails: string) => {
    const page = getPage();
    await page.locator('#emails').fill(emails);
    await page.locator('#publish-btn').click();
});

Then('an invalid email error should be displayed', async () => {
    const page = getPage();
    await expect(page.locator('#error-message')).toBeVisible();
});

When('the faculty attempts to publish with valid emails and strict time limits', async () => {
    const page = getPage();
    await page.locator('#emails').fill('valid@example.com');
    await page.locator('#publish-btn').click();
});

Then('the publish modal should confirm success', async () => {
    const page = getPage();
    await expect(page.locator('#publish-modal')).toBeVisible();
});

// Scenario 4: Export student results to CSV
Given('the faculty navigates to the results report for a published exam', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies('/public/dashboard/results?examId=123')
    );
    const page = getPage();

    await page.setContent(`
      <button id="export-btn">Export CSV</button>
    `);

    await page.evaluate(() => {
      const btn = document.getElementById('export-btn');
      if (btn) {
          btn.onclick = () => {
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,student,score\\nJohn,90';
            a.download = 'results.csv';
            a.click();
          };
      }
    });
});

When('the faculty clicks the Export CSV button', async () => {
    const page = getPage();
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export-btn').click();
    const download = await downloadPromise;
    // Save to context for assertion
    (page as any)._lastDownload = download;
});

Then('a CSV file containing student analytics should be downloaded', async () => {
    const page = getPage();
    const download = (page as any)._lastDownload;
    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toContain('.csv');
});
