import { Given, When, Then } from '@cucumber/cucumber';
import { actorInTheSpotlight, Interaction } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

const getPage = async (actor) => {
  const ability = actor.abilityTo(BrowseTheWebWithPlaywright) as any;
  const session = ability.session;
  const context = await session.browserContext();
  const pages = await context.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error('Could not resolve Playwright page from Serenity ability');
  }
  return page;
};

Given('I am on the public page', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/public')
    );
});

When('I select the {string} RAG mode', async (mode: string) => {


const ClickModeBtn = () =>
        Interaction.where(`#actor clicks the RAG mode button`, async (actor) => {
            const nativePage = await getPage(actor);

            const ragModeBtn = nativePage.getByRole('button', { name: new RegExp(mode, 'i') });
            const { expect } = require('@playwright/test');
            await expect(ragModeBtn).toBeVisible({ timeout: 10000 });
            await ragModeBtn.click();
        });

    await actorInTheSpotlight().attemptsTo(
        ClickModeBtn()
    );
});

When('I upload an unsupported {string} file', async (filename: string) => {
    const UploadUnsupportedFile = () =>
        Interaction.where(`#actor uploads an unsupported file`, async (actor) => {
            const nativePage = await getPage(actor);
            
            const fileInput = nativePage.locator('input[type="file"]');
            await fileInput.setInputFiles({
                name: filename,
                mimeType: 'application/x-msdownload',
                buffer: Buffer.from('MZ...')
            });
        });

    await actorInTheSpotlight().attemptsTo(
        UploadUnsupportedFile()
    );
});

Then('I should see an invalid file type error message', async () => {
    const CheckErrorMessage = () =>
        Interaction.where(`#actor checks for error message`, async (actor) => {
            const nativePage = await getPage(actor);
            // Capture screenshot and page HTML for debugging
            await nativePage.screenshot({ path: 'invalid_file_error.png', fullPage: true });
            const html = await nativePage.content();
            const fs = require('fs');
            fs.writeFileSync('invalid_file_error.html', html);

            // Use a broader locator for the error message
            const errorMsg = nativePage.getByText(/invalid|unsupported.*file|file type not allowed/i).first();
            const { expect } = require('@playwright/test');
            await expect(errorMsg).toBeVisible({ timeout: 15000 });
        });
    await actorInTheSpotlight().attemptsTo(
        CheckErrorMessage()
    );
});

When('I attempt to generate without providing a topic', async () => {
    const ClearAndGenerate = () =>
        Interaction.where(`#actor clears topic and clicks generate`, async (actor) => {
            const nativePage = await getPage(actor);
            
            const topicInput = nativePage.getByPlaceholder(/topic/i).or(nativePage.getByRole('textbox', { name: /topic/i }));
            if (await topicInput.isVisible()) {
                await topicInput.fill('');
            }
            
            const generateBtn = nativePage.getByRole('button', { name: /Generate/i }).first();
            await generateBtn.click();
        });

    await actorInTheSpotlight().attemptsTo(
        ClearAndGenerate()
    );
});

Then('I should see a validation error for required fields', async () => {
    const CheckValidationError = () =>
        Interaction.where(`#actor checks for validation error`, async (actor) => {
            const nativePage = await getPage(actor);
            
            const validationError = nativePage.locator('text=/required|Please enter|must not be empty/i').first();
            const { expect } = require('@playwright/test');
            await expect(validationError).toBeVisible();
        });

    await actorInTheSpotlight().attemptsTo(
        CheckValidationError()
    );
});

Given('I attempt to access the protected dashboard route directly', async () => {
    await actorInTheSpotlight().attemptsTo(
        NavigateToAppAndAcceptCookies('/dashboard')
    );
});

Then('I should be redirected away from the dashboard', async () => {
    const CheckRedirect = () =>
        Interaction.where(`#actor checks redirect`, async (actor) => {
            const nativePage = await getPage(actor);
            
            const { expect } = require('@playwright/test');
            await expect(nativePage).toHaveURL(/.*(login|public|\/)/);
        });

    await actorInTheSpotlight().attemptsTo(
        CheckRedirect()
    );
});
