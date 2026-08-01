import { test, expect } from '@playwright/test';

test('search and add Dolo 360 to cart on 1mg', async ({ page }) => {
  await page.goto('https://www.1mg.com/');

  const searchField = page.getByRole('textbox', { name: /Search for Medicines and Health Products/i });
  await expect(searchField).toBeVisible({ timeout: 20000 });

  await searchField.fill('Dolo 360');
  await page.keyboard.press('Enter');

  const productTile = page.locator('div', { hasText: /Dolo 360/i }).first();
  await expect(productTile).toBeVisible({ timeout: 30000 });

  const addToCartButton = productTile.getByRole('button', { name: /Add to cart/i }).first();
  await expect(addToCartButton).toBeVisible({ timeout: 20000 });
  await addToCartButton.click();

  const cartIcon = page.getByRole('link', { name: /cart icon/i }).first();
  await expect(cartIcon).toBeVisible({ timeout: 20000 });
});
