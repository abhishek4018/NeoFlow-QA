import { test, expect } from '@playwright/test';

test('manual authoring flow on public page', async ({ page }) => {
  await page.goto('http://localhost:3000/public', { waitUntil: 'networkidle', timeout: 120000 });

  await page.getByRole('button', { name: /manual authoring/i }).click();
  await expect(page.getByText('MANUAL QUESTION AUTHORING')).toBeVisible({ timeout: 20000 });

  await page.getByRole('button', { name: /add question/i }).click();
  await expect(page.getByText('1 QUESTION IN BLUEPRINT')).toBeVisible({ timeout: 20000 });
});
