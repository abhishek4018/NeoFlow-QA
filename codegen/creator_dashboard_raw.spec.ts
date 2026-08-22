import { expect,test } from '@playwright/test';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  test.setTimeout(60000);
  // Login step (fallback if not already authenticated)
  await page.goto('https://uat.quickexamcreator.com/login');
  await page.getByLabel('Email').fill('testuser@example.com');
  await page.getByLabel('Password').fill('Password123');
  await page.getByRole('button', { name: /Login/i }).click();
  // Ensure login succeeded and dashboard is reachable
  await page.waitForLoadState('networkidle');

  const baseUrl = 'https://uat.quickexamcreator.com';
  const dashboardUrl = `${baseUrl}/dashboard`;

  // Navigate to dashboard (assumes authentication via magic link token if present)
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);

  // Click on Add Question button
  await page.getByRole('button', { name: /Add Question/i }).click();

  // Fill in the question form
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');

  // Submit the form
  await page.getByRole('button', { name: /Create/i }).click();

  // Verify the new question appears in the list
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});
