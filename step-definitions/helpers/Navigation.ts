import { Interaction, Task } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Navigate } from '@serenity-js/web';

/**
 * Resolves a route path or full URL against process.env.BASE_URL
 */
export function resolveTargetUrl(targetPathOrUrl: string): string {
    if (targetPathOrUrl.startsWith('http://') || targetPathOrUrl.startsWith('https://')) {
        return targetPathOrUrl;
    }
    const baseUrl = (process.env.BASE_URL || '').replace(/\/+$/, '');
    if (!baseUrl) {
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
            const context = playwright?.browserContext || playwright?.context;
            const pages = context?.pages?.() || [];
            const page = pages[pages.length - 1];
            if (page) {
                const acceptBtn = page.getByRole('button', { name: /Accept & Continue|Save & Continue|Accept/i });
                if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await acceptBtn.click().catch(() => {});
                }
            }
        })
    );
};
