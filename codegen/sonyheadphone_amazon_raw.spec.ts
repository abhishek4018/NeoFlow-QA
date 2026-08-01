import { test, expect } from '@playwright/test';

test('search for Sony headphone on Amazon', async ({ page }) => {
  await page.goto('https://www.amazon.com/');

  const searchField = page.locator('#twotabsearchtextbox');
  await expect(searchField).toBeVisible({ timeout: 30000 });

  await searchField.fill('sony headphone');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/k=sony(?:\+|%20)headphone|field-keywords=sony(?:\+|%20)headphone/i, { timeout: 30000 });

  const resultsHeader = page.locator('span.a-color-state, span.a-size-medium.a-color-base.a-text-normal');
  await expect(resultsHeader.first()).toBeVisible({ timeout: 30000 });
  await expect(resultsHeader.first()).toContainText(/sony headphone/i);
});
