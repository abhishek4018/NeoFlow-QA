// step-definitions/helpers/Navigation.ts
// Helper to navigate to a URL and accept the cookie/DPDP banner if present.

import { Interaction,Task } from '@serenity-js/core';
import { By,Navigate, PageElement } from '@serenity-js/web';

import { ClickWhenReady } from './Interactions';

/**
 * Navigate to the given URL and, if the cookie/DPDP acceptance dialog appears,
 * click the appropriate button to dismiss it.
 *
 * Tries a role‑based locator first; if that fails, falls back to an XPath selector.
 */
export const NavigateToAppAndAcceptCookies = (url: string) =>
  Task.where(`#actor navigates to ${url} and accepts cookies`,
    // 1️⃣ Navigate to the URL
    Navigate.to(url),
    // 2️⃣ Try to click the consent button if it appears
    Interaction.where('Accept cookie banner if present', async (actor) => {
      const acceptButton = PageElement.located(By.role('button', { name: 'Accept & Continue' }));
      await (actor as any).attemptsTo(ClickWhenReady(acceptButton as any));
    })
  );
