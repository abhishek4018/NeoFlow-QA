// step-definitions/helpers/Navigation.ts
// Helper to navigate to a URL and accept the cookie/DPDP banner if present.

import { Interaction, Task } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Navigate } from '@serenity-js/web';

/**
 * Resolves a route path or full URL against process.env.BASE_URL
 */
export function resolveTargetUrl(targetPathOrUrl: string): string {
    const baseUrl = (process.env.BASE_URL || 'https://quickexamcreator.com').replace(/\/+$/, '');
    if (targetPathOrUrl.startsWith('http://') || targetPathOrUrl.startsWith('https://')) {
        return targetPathOrUrl;
    }
    const cleanPath = targetPathOrUrl.startsWith('/') ? targetPathOrUrl : `/${targetPathOrUrl}`;
    return `${baseUrl}${cleanPath}`;
}

/**
 * Navigate to the given URL or relative path and dismiss cookie dialog if present.
 */
export const NavigateToAppAndAcceptCookies = (pathOrUrl: string) => {
    const fullUrl = resolveTargetUrl(pathOrUrl);
    return Task.where(`#actor navigates to ${fullUrl} and accepts cookies`,
        Navigate.to(fullUrl),
        Interaction.where('Accept cookie banner if present', async (actor) => {
            const playwright = (actor as any).abilityTo(BrowseTheWebWithPlaywright);
            const context = playwright.browserContext || playwright.context;
            const pages = context?.pages?.() || [];
            const page = pages[pages.length - 1];
            if (page) {
                const acceptBtn = page.getByRole('button', { name: 'Accept & Continue' });
                if (await acceptBtn.isVisible().catch(() => false)) {
                    await acceptBtn.click().catch(() => {});
                }
            }
        })
    );
};
