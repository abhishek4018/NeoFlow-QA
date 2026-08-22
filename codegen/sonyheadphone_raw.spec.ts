import { expect,test } from '@playwright/test';

test('search for Sony headphone on Flipkart', async ({ page }) => {
  await page.goto('https://www.flipkart.com/');

  const closeLoginPopup = page.getByRole('button', { name: '✕' });
  if (await closeLoginPopup.count() > 0) {
    await closeLoginPopup.first().click();
  }

  const searchField = page.getByRole('textbox', { name: /Search for Products, Brands and More/i });
  await expect(searchField).toBeVisible({ timeout: 30000 });

  await searchField.fill('sony headphone');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/search\?q=sony(?:\+|%20)headphone/i, { timeout: 30000 });

  const searchResult = page.locator('div', { hasText: /sony headphone|sony/i }).first();
  await expect(searchResult).toBeVisible({ timeout: 30000 });
});
