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

    public async extractPageInventory(page: Page): Promise<import('./types').PageElementInventory> {
        return await page.evaluate(() => {
            const items: import('./types').PageInventoryItem[] = [];
            const headings: string[] = [];
            const buttons: string[] = [];
            const links: string[] = [];
            const inputs: string[] = [];

            // 1. Headings (h1, h2, h3)
            const headingEls = Array.from(document.querySelectorAll('h1, h2, h3'));
            for (const h of headingEls) {
                const text = h.textContent?.trim() || '';
                if (text && text.length > 2 && text.length < 100 && !headings.includes(text)) {
                    headings.push(text);
                    items.push({
                        elementType: 'Heading',
                        identifier: text,
                        targetRole: h.tagName.toLowerCase()
                    });
                }
            }

            // 2. Buttons
            const btnEls = Array.from(document.querySelectorAll('button'));
            for (const b of btnEls) {
                const text = (b.getAttribute('aria-label') || b.textContent)?.trim() || '';
                if (text && text.length > 1 && text.length < 60 && !buttons.includes(text) && !/accept|cookie|close/i.test(text)) {
                    buttons.push(text);
                    items.push({
                        elementType: 'Button',
                        identifier: text,
                        targetRole: 'button'
                    });
                }
            }

            // 3. Action Links / Support Links
            const linkEls = Array.from(document.querySelectorAll('a[href]'));
            for (const a of linkEls) {
                const text = (a.getAttribute('aria-label') || a.textContent)?.trim() || '';
                const href = a.getAttribute('href') || '';
                const label = href.startsWith('mailto:') ? href.replace('mailto:', '') : text;
                if (label && label.length > 2 && label.length < 80 && !links.includes(label)) {
                    links.push(label);
                    items.push({
                        elementType: 'Link',
                        identifier: label,
                        targetRole: 'link'
                    });
                }
            }

            // 4. Form Inputs & Textareas
            const inputEls = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea'));
            for (const inp of inputEls) {
                const label = (inp.getAttribute('aria-label') || inp.getAttribute('placeholder') || inp.getAttribute('name'))?.trim() || '';
                if (label && !inputs.includes(label)) {
                    inputs.push(label);
                    items.push({
                        elementType: inp.tagName.toLowerCase() === 'textarea' ? 'Textarea' : 'Input',
                        identifier: label,
                        targetRole: inp.tagName.toLowerCase()
                    });
                }
            }

            return {
                headings: headings.slice(0, 5),
                buttons: buttons.slice(0, 5),
                links: links.slice(0, 8),
                inputs: inputs.slice(0, 5),
                items: items.slice(0, 15)
            };
        });
    }
}
