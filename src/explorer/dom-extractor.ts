import { Page } from '@playwright/test';

import { InteractiveElementAction } from './types';

export class DOMExtractor {
    public async extractInteractiveElements(page: Page): Promise<InteractiveElementAction[]> {
        return await page.evaluate(() => {
            const results: InteractiveElementAction[] = [];

            // 1. Extract Links
            const anchors = Array.from(document.querySelectorAll('a[href]'));
            for (const a of anchors) {
                const href = a.getAttribute('href');
                if (!href || href.startsWith('javascript:') || href.startsWith('#')) continue;

                const text = a.textContent?.trim() || '';
                const ariaLabel = a.getAttribute('aria-label') || '';
                const label = ariaLabel || text || href;

                results.push({
                    elementTag: 'a',
                    actionType: 'click',
                    selector: ariaLabel ? `//a[@aria-label="${ariaLabel}"]` : `//a[normalize-space()="${text}"]`,
                    label: label,
                    targetUrl: href
                });
            }

            // 2. Extract Buttons
            const buttons = Array.from(document.querySelectorAll('button'));
            for (const btn of buttons) {
                const text = btn.textContent?.trim() || '';
                const ariaLabel = btn.getAttribute('aria-label') || '';
                const id = btn.getAttribute('id');
                const label = ariaLabel || text || id || 'button';

                let selector = `//button[normalize-space()="${text}"]`;
                if (id) {
                    selector = `#${id}`;
                } else if (ariaLabel) {
                    selector = `//button[@aria-label="${ariaLabel}"]`;
                }

                results.push({
                    elementTag: 'button',
                    actionType: 'click',
                    selector,
                    label
                });
            }

            // 3. Extract Inputs
            const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea'));
            for (const input of inputs) {
                const name = input.getAttribute('name');
                const placeholder = input.getAttribute('placeholder');
                const ariaLabel = input.getAttribute('aria-label');
                const type = input.getAttribute('type') || 'text';
                const label = ariaLabel || placeholder || name || 'input';

                let selector = `input[name="${name}"]`;
                if (ariaLabel) {
                    selector = `[aria-label="${ariaLabel}"]`;
                } else if (placeholder) {
                    selector = `[placeholder="${placeholder}"]`;
                }

                results.push({
                    elementTag: 'input',
                    actionType: 'fill',
                    selector,
                    label,
                    inputType: type
                });
            }

            return results;
        });
    }
}
