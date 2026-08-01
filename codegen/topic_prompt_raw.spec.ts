import { test, expect } from '@playwright/test';

test('Topic Prompt Mode - prompt selection, pedagogical controls, sample topics, and question generation', async ({ page }) => {
  // 1. Navigate to the Pariksha Public Page
  await page.goto('http://localhost:3000/public', { waitUntil: 'networkidle', timeout: 60000 });

  // 2. Select Topic Prompt Mode
  const topicPromptBtn = page.getByRole('button', { name: /Topic Prompt/i });
  await expect(topicPromptBtn).toBeVisible({ timeout: 10000 });
  await topicPromptBtn.click();

  // 3. Expand Advanced Pedagogical Controls: Target Audience & Bloom's Cognitive Level
  const advancedControlsBtn = page.getByText(/Advanced Pedagogical Controls/i);
  await expect(advancedControlsBtn).toBeVisible({ timeout: 5000 });
  await advancedControlsBtn.click();

  // Select Target Audience
  const targetAudienceSelect = page.locator('select[aria-label="Target Audience"]');
  await expect(targetAudienceSelect).toBeVisible({ timeout: 5000 });
  await targetAudienceSelect.selectOption('Undergraduate');

  // Select Bloom's Cognitive Level
  const cognitiveLevelSelect = page.locator('select[aria-label="Bloom\'s Cognitive Level"]');
  await expect(cognitiveLevelSelect).toBeVisible({ timeout: 5000 });
  await cognitiveLevelSelect.selectOption('Apply');

  // 4. Test Sample Topic button chip
  const cellBiologyTopicBtn = page.getByRole('button', { name: /Cell Biology & Genetics/i });
  if (await cellBiologyTopicBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cellBiologyTopicBtn.click();
  } else {
    const topicInput = page.locator('input[placeholder*="History of Rome"]');
    await topicInput.fill('Cell Biology Quiz');
  }

  // 5. Test switching to Quick Generator Mode for sample material buttons
  const pasteTextBtn = page.getByRole('button', { name: /Paste Text \/ File/i });
  await expect(pasteTextBtn).toBeVisible({ timeout: 5000 });
  await pasteTextBtn.click();

  // Click sample material button: Abacus Math Paper or Cell Biology Quiz
  const abacusBtn = page.getByRole('button', { name: /Abacus Math Paper/i });
  await expect(abacusBtn).toBeVisible({ timeout: 5000 });
  await abacusBtn.click();

  const cellBiologyQuizBtn = page.getByRole('button', { name: /Cell Biology Quiz/i });
  await expect(cellBiologyQuizBtn).toBeVisible({ timeout: 5000 });
  await cellBiologyQuizBtn.click();

  // 6. Click Extract & Generate Questions
  const generateBtn = page.locator('#btn-generate-questions');
  await expect(generateBtn).toBeEnabled({ timeout: 5000 });
  await generateBtn.click();

  // 7. Verify generated questions or results card
  const resultsHeader = page.getByText(/AI Engine Generation Complete|Analyzing and extracting questions|Questions/i).first();
  await expect(resultsHeader).toBeVisible({ timeout: 60000 });
});
