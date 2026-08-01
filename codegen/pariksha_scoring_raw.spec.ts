import { test, expect } from '@playwright/test';

test('candidate registration, multi-type question answering, pre-submission decision modal confirmation, and student pedagogical results', async ({ page }) => {
  // Step 1: Navigate to public exam
  await page.goto('http://localhost:3000/public/exam/35');

  // Step 2: Candidate registration
  const firstNameInput = page.locator('#firstName');
  await expect(firstNameInput).toBeVisible({ timeout: 10000 });
  await firstNameInput.fill('Neo Tester');

  const startBtn = page.locator('#btn-start-assessment');
  await expect(startBtn).toBeEnabled({ timeout: 5000 });
  await startBtn.click();

  // Step 3: Candidate guidelines (if present)
  const agreeBtn = page.locator('#btn-agree-start-test');
  if (await agreeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await agreeBtn.click();
  }

  // Step 4: Multi-type question answering loop
  let hasMoreQuestions = true;
  let safetyCounter = 0;

  while (hasMoreQuestions && safetyCounter < 15) {
    safetyCounter++;

    // Wait for current question card to load
    await page.waitForTimeout(500);

    // Option 1: MCQ options (labels)
    const options = page.locator('label');
    const optionCount = await options.count();

    if (optionCount > 0) {
      await options.first().click();
    } else {
      // Option 2: Text / Numeric entry input
      const textInput = page.locator('input[type="text"], input[type="number"], textarea').first();
      if (await textInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        const inputType = await textInput.getAttribute('type');
        if (inputType === 'number') {
          await textInput.fill('7');
        } else {
          await textInput.fill('Sample Answer');
        }
      }
    }

    // Check navigation buttons
    const reviewBtn = page.getByRole('button', { name: /Review & Finalize/i });
    const nextBtn = page.getByRole('button', { name: /^Next$/i });

    if (await reviewBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await reviewBtn.click();
      hasMoreQuestions = false;
    } else if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nextBtn.click();
    } else {
      hasMoreQuestions = false;
    }
  }

  // Step 5: Pre-submission decision modal confirmation
  const confirmSubmitBtn = page.locator('#btn-confirm-submit-assessment');
  await expect(confirmSubmitBtn).toBeVisible({ timeout: 10000 });
  await confirmSubmitBtn.click();

  // Step 6: Student pedagogical results
  const pedagogicalHeading = page.getByText(/Pedagogical Review|Results Summary/i).first();
  await expect(pedagogicalHeading).toBeVisible({ timeout: 15000 });
});
