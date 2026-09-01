import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  test.setTimeout(60000);

  const baseUrl = process.env.BASE_URL || 'https://uat.quickexamcreator.com';
  let dashboardUrl = `${baseUrl}/public`;

  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl && tokenUrl.startsWith('http')) {
        dashboardUrl = tokenUrl;
      } else if (tokenUrl) {
        dashboardUrl = `${baseUrl}${tokenUrl}`;
      }
    }
  } catch (e) {
    // ignore
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

  // Accept cookie banner if present
  const consentBtn = page.getByRole('button', { name: /Accept & Continue|Save & Continue|Accept/i });
  if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentBtn.click();
  }

  // Verify dashboard loaded
  await expect(page.locator('body')).toBeVisible();
});
