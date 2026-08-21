import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  // Extend timeout for slower environments
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore any read errors
  }

  // Navigate to dashboard
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Add a new question
  await page.getByRole('button', { name: /Add Question/i }).click();
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the question appears
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) {
    // ignore
  }

  // Navigate to dashboard using the resolved URL
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Click on "Add Question" button
  await page.getByRole('button', { name: /Add Question/i }).click();

  // Fill in the question form
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');

  // Submit the form
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears in the list
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) { /* ignore */ }

  // Navigate to dashboard using the resolved URL
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Click on "Add Question" button
  await page.getByRole('button', { name: /Add Question/i }).click();

  // Fill in the question form
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');

  // Submit the form
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears in the list
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test('Creator can access dashboard and add a new question', async ({ page }) => {
  test.setTimeout(60000);

  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) { /* ignore */ }

  // Navigate to dashboard using the resolved URL
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Click on "Add Question" button
  await page.getByRole('button', { name: /Add Question/i }).click();

  // Fill in the question form
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');

  // Submit the form
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears in the list
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});

import fs from 'fs';

test.setTimeout(60000);

  await page.waitForLoadState('domcontentloaded');
  // Load magic link token if available for authenticated access
  let dashboardUrl = '/dashboard';
  try {
    if (fs.existsSync('.magic_link_token.tmp')) {
      const tokenUrl = fs.readFileSync('.magic_link_token.tmp', 'utf-8').trim();
      if (tokenUrl) dashboardUrl = tokenUrl;
    }
  } catch (e) { /* ignore */ }

  // Navigate to dashboard using the resolved URL
  await page.goto(dashboardUrl);
  await expect(page).toHaveURL(/\/dashboard/);
  // Wait for network idle after navigation
  await page.waitForLoadState('networkidle');

  // Click on "Add Question" button
  await page.getByRole('button', { name: /Add Question/i }).click();

  // Fill in the question form
  await page.getByLabel('Title').fill('Sample Question');
  await page.getByLabel('Description').fill('This is a sample question description.');

  // Submit the form
  await page.getByRole('button', { name: /Create/i }).click();
  await page.waitForLoadState('networkidle');

  // Verify the new question appears in the list
  const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  await expect(newQuestion).toBeVisible();
});
