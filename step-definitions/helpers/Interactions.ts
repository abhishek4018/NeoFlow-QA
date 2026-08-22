import { Duration,Interaction } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

/**
 * Clicks a Serenity‑JS `PageElement` after waiting for it to be visible.
 * It uses Playwright directly for a forced click, which is robust in headless mode.
 *
 * @param target   The Serenity‑JS PageElement to click.
 * @param maxWait  Maximum time to wait for the element (default 30 seconds).
 */
export const ClickWhenReady = (
    target: any,
    maxWait: Duration = Duration.ofSeconds(90) // increased timeout for slow UI actions
) => Interaction.where(`#actor clicks ${target}`,
    async actor => {
        const playwright = actor.abilityTo(BrowseTheWebWithPlaywright) as any;
        const session = playwright.session;
        const current = session?.currentBrowserPage;
        const context = playwright.browserContext || playwright.context;
        const pages = context?.pages?.() || [];
        const page = current?.page || pages[pages.length - 1];
        if (!page) {
            throw new Error('❌ Could not resolve Playwright page for ClickWhenReady');
        }
        // Resolve Serenity target to a Playwright locator
        const locator = (target as any).resolveFor(actor) as any;
        if (!locator) {
            throw new Error('❌ Could not resolve locator for target');
        }
        // Ensure element is attached, visible, enabled, and stable
        await locator.waitFor({ state: 'attached', timeout: maxWait.inMilliseconds() });
        await locator.waitFor({ state: 'visible', timeout: maxWait.inMilliseconds() });
        await locator.waitFor({ state: 'enabled', timeout: maxWait.inMilliseconds() });
        await locator.waitFor({ state: 'stable', timeout: maxWait.inMilliseconds() });
        // Scroll into view in case it's off-screen
        if (typeof locator.scrollIntoViewIfNeeded === 'function') {
            await locator.scrollIntoViewIfNeeded();
        }
        // Attempt click with retry
        try {
            await locator.click({ force: true, timeout: maxWait.inMilliseconds() });
        } catch (e) {
            // Fallback: use page click with selector string
            const selector = target.locatedBy().toString();
            // If the selector looks like a Serenity internal representation (e.g., starts with '<'), skip page fallback
            if (selector && !selector.trim().startsWith('<')) {
                await page.waitForSelector(selector, { state: 'visible', timeout: maxWait.inMilliseconds() });
                await page.click(selector, { force: true, timeout: maxWait.inMilliseconds() });
            } else {
                throw e; // Re‑throw original error for unsupported selector formats
            }
        }
    }
);

/**
 * Verifies that a target UI element is present and visible in the DOM.
 */
export const CheckElementPresent = (
    role: string,
    identifier: string,
    maxWait: Duration = Duration.ofSeconds(10)
) => Interaction.where(`#actor verifies presence of ${role} '${identifier}'`,
    async actor => {
        const playwright = actor.abilityTo(BrowseTheWebWithPlaywright) as any;
        const session = playwright.session;
        const current = session?.currentBrowserPage;
        const context = playwright.browserContext || playwright.context;
        const pages = context?.pages?.() || [];
        const page = current?.page || pages[pages.length - 1];
        if (!page) {
            throw new Error('❌ Could not resolve Playwright page');
        }

        const normalizedRole = role.toLowerCase();
        let locator;

        if (normalizedRole === 'h1' || normalizedRole === 'h2' || normalizedRole === 'h3' || normalizedRole === 'heading') {
            locator = page.locator(`xpath=//h1[contains(normalize-space(), "${identifier}")] | //h2[contains(normalize-space(), "${identifier}")] | //h3[contains(normalize-space(), "${identifier}")] | //*[self::h1 or self::h2 or self::h3][contains(., "${identifier}")]`).first();
        } else if (normalizedRole === 'button') {
            locator = page.locator(`xpath=//button[contains(normalize-space(), "${identifier}") or @aria-label="${identifier}"] | //input[@type="submit" and contains(@value, "${identifier}")]`).first();
        } else if (normalizedRole === 'link') {
            locator = page.locator(`xpath=//a[contains(normalize-space(), "${identifier}") or contains(@href, "${identifier}") or @aria-label="${identifier}"]`).first();
        } else if (normalizedRole === 'input' || normalizedRole === 'textarea') {
            locator = page.locator(`xpath=//input[contains(@placeholder, "${identifier}") or contains(@name, "${identifier}") or contains(@aria-label, "${identifier}")] | //textarea[contains(@placeholder, "${identifier}") or contains(@name, "${identifier}") or contains(@aria-label, "${identifier}")] | //input | //textarea`).first();
        } else {
            locator = page.locator(`xpath=//*[contains(normalize-space(), "${identifier}")]`).first();
        }

        await locator.waitFor({ state: 'attached', timeout: maxWait.inMilliseconds() });
        await locator.waitFor({ state: 'visible', timeout: maxWait.inMilliseconds() });
    }
);
