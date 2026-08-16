// step-definitions/helpers/Navigation.ts
// Helper to navigate to a URL and accept the cookie/DPDP banner if present.

import { Task, Interaction } from '@serenity-js/core';
import { Navigate, Click, PageElement, By } from '@serenity-js/web';

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
      const roleButton = PageElement.located(
        By.role('button', { name: 'Accept & Continue' })
      );
      try {
        await (actor as any).attemptsTo(Click.on(roleButton));
      } catch {
        const xpathButton = PageElement.located(
          By.xpath('/html/body/div[2]/div[2]/button[2]')
        );
        try {
          await (actor as any).attemptsTo(Click.on(xpathButton));
        } catch {
          // No consent button – safe to ignore
        }
      }
    })
  );
