import { test, expect } from '@playwright/test';

const { firefox } = require('playwright');

(async () => {
  const browser = await firefox.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://uat.quickexamcreator.com/');
  await page.getByText('Digital Personal Data Protection (DPDP) NoticeVatra Assess uses essential').click();
  await page.getByRole('button', { name: 'Accept & Continue' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();