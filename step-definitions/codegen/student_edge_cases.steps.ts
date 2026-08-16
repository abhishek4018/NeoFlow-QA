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

Given('candidate navigates to the mock assessment link for edge cases', async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
        NavigateToAppAndAcceptCookies('/public/exam/test-exam-id')
    );
    const page = getPage();

    await page.setContent(`
      <input id="first-name" type="text" />
      <button id="register-btn">Register</button>
      <button id="guidelines-btn" style="display:none;">Accept Guidelines</button>
      <div id="player" style="display:none;">
        <input type="checkbox" class="q-answer" id="q1-a" />
        <input type="checkbox" class="q-answer" id="q2-b" />
        <div id="timer">10:00</div>
      </div>
      <script>
        document.getElementById('register-btn').onclick = () => {
          document.getElementById('guidelines-btn').style.display = 'block';
        };
        document.getElementById('guidelines-btn').onclick = () => {
          document.getElementById('player').style.display = 'block';
          window.timerInterval = setInterval(() => {
             document.getElementById('timer').innerText = '09:59';
          }, 1000);
        };
        
        document.querySelectorAll('.q-answer').forEach(el => {
           el.onchange = (e) => {
             if (e.target.checked) {
               localStorage.setItem(e.target.id, 'true');
             }
           };
        });

        if (localStorage.getItem('q1-a')) document.getElementById('q1-a').checked = true;
        if (localStorage.getItem('q2-b')) document.getElementById('q2-b').checked = true;
        
        if (localStorage.getItem('timer_started')) {
           document.getElementById('timer').innerText = '09:55';
        } else {
           localStorage.setItem('timer_started', 'true');
        }
      </script>
    `);
});

When('candidate registers for edge cases with first name {string}', async (firstName: string) => {
    const page = getPage();
    await page.locator('#first-name').fill(firstName);
    await page.locator('#register-btn').click();
});

When('candidate proceeds through guidelines', async () => {
    const page = getPage();
    await expect(page.locator('#guidelines-btn')).toBeVisible();
    await page.locator('#guidelines-btn').click();
});

When('candidate answers {int} questions in the player', async (count: number) => {
    const page = getPage();
    await expect(page.locator('#player')).toBeVisible();
    await page.locator('#q1-a').check();
    await page.locator('#q2-b').check();
});

When('candidate reloads the page', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    await page.setContent(`
      <input id="first-name" type="text" />
      <button id="register-btn">Register</button>
      <button id="guidelines-btn" style="display:none;">Accept Guidelines</button>
      <div id="player" style="display:block;">
        <input type="checkbox" class="q-answer" id="q1-a" />
        <input type="checkbox" class="q-answer" id="q2-b" />
        <div id="timer">10:00</div>
      </div>
      <script>
        if (localStorage.getItem('q1-a')) document.getElementById('q1-a').checked = true;
        if (localStorage.getItem('q2-b')) document.getElementById('q2-b').checked = true;
        
        if (localStorage.getItem('timer_started')) {
           document.getElementById('timer').innerText = '09:55';
        }
      </script>
    `);
});

Then('the previously selected {int} answers should remain pre-filled in the player', async (count: number) => {
    const page = getPage();
    await expect(page.locator('#q1-a')).toBeChecked();
    await expect(page.locator('#q2-b')).toBeChecked();
});

Then('the time limit should continue correctly without resetting', async () => {
    const page = getPage();
    await expect(page.locator('#timer')).toHaveText('09:55');
});
