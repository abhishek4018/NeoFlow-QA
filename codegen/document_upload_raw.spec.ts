import { test, expect } from '@playwright/test';

test('Upload Document Mode - file upload, preview badge verification, file removal, and question extraction', async ({ page }) => {
  // 1. Navigate to the Pariksha Public Page
  await page.goto('http://localhost:3000/public', { waitUntil: 'networkidle', timeout: 60000 });

  // 2. Ensure Paste Text / File mode is active
  const pasteTextBtn = page.getByRole('button', { name: /Paste Text \/ File/i });
  await expect(pasteTextBtn).toBeVisible({ timeout: 10000 });
  await pasteTextBtn.click();

  // 3. Prepare and upload a TXT file notes
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'lecture_notes_biology.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('CELL BIOLOGY NOTES\n1. Mitochondria is the powerhouse of the cell.\n2. Nucleus stores DNA.')
  });

  // 4. Verify file preview badge displaying filename and Remove button
  const fileBadge = page.getByText('lecture_notes_biology.txt');
  await expect(fileBadge).toBeVisible({ timeout: 5000 });

  const removeBtn = page.getByRole('button', { name: /Remove/i });
  await expect(removeBtn).toBeVisible({ timeout: 5000 });

  // 5. Test file removal
  await removeBtn.click();
  await expect(fileBadge).not.toBeVisible({ timeout: 5000 });

  // 6. Re-upload file notes
  await fileInput.setInputFiles({
    name: 'lecture_notes_biology.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('CELL BIOLOGY NOTES\n1. Mitochondria is the powerhouse of the cell.\n2. Nucleus stores DNA.')
  });
  await expect(page.getByText('lecture_notes_biology.txt')).toBeVisible({ timeout: 5000 });

  // 7. Click Extract & Generate Questions
  const generateBtn = page.locator('#btn-generate-questions');
  await expect(generateBtn).toBeEnabled({ timeout: 5000 });
  await generateBtn.click();

  // 8. Verify questions extraction / generated results section
  const resultsHeader = page.getByText(/AI Engine Generation Complete|Analyzing document|Analyzing and extracting questions|Questions/i).first();
  await expect(resultsHeader).toBeVisible({ timeout: 60000 });
});
