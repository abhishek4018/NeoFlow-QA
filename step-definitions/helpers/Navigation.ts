import { Interaction, Task } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Navigate } from '@serenity-js/web';
import { By, Click, PageElement } from '@serenity-js/web';
import { actorInTheSpotlight } from '@serenity-js/core';

export const NavigateToAppAndAcceptCookies = (path: string) =>
    Task.where(`#actor navigates to ${path} and accepts cookies`,
        Interaction.where(`#actor navigates to the application URL`, async actor => {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
            await Navigate.to(url).performAs(actor);
        }),
        Interaction.where(`#actor accepts cookies if present`, async actor => {
            // Try the role‑based locator first
            try {
                await actorInTheSpotlight().attemptsTo(
                    Click.on(PageElement.located(By.role('button', { name: 'Accept & Continue' })))
                );
                return;
            } catch (_) {
                // Fallback to XPath if the role locator fails
                await actorInTheSpotlight().attemptsTo(
                    Click.on(PageElement.located(By.xpath('/html/body/div[2]/div[2]/button[2]')))
                );
            }
        })
    );
