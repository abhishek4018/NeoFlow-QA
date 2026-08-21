import { test, expect } from '@playwright/test';
import { DOMExtractor } from '../../src/explorer/dom-extractor';

test.describe('DOM Extractor for Autonomous Explorer', () => {
    test('extracts actionable elements and normalized selectors from html page', async ({ page }) => {
        // Render a sample mock page
        await page.setContent(`
            <html>
                <body>
                    <header>
                        <nav>
                            <a href="/guides" aria-label="Exam Guides">Guides</a>
                            <a href="/about">About Us</a>
                        </nav>
                    </header>
                    <main>
                        <h1>Explore Features</h1>
                        <button id="cta-btn" aria-label="Start Free Assessment">Get Started</button>
                        <form action="/contact" method="POST">
                            <input type="email" placeholder="Enter your email" name="user_email" />
                            <button type="submit">Submit Inquiry</button>
                        </form>
                    </main>
                </body>
            </html>
        `);

        const extractor = new DOMExtractor();
        const actions = await extractor.extractInteractiveElements(page);

        expect(actions.length).toBeGreaterThan(3);

        // Verify anchor link extraction
        const guidesLink = actions.find(a => a.label === 'Exam Guides' || a.label === 'Guides');
        expect(guidesLink).toBeDefined();
        expect(guidesLink?.actionType).toBe('click');
        expect(guidesLink?.targetUrl).toBe('/guides');

        // Verify button extraction
        const ctaBtn = actions.find(a => a.label === 'Start Free Assessment' || a.label === 'Get Started');
        expect(ctaBtn).toBeDefined();
        expect(ctaBtn?.actionType).toBe('click');

        // Verify input element extraction
        const emailInput = actions.find(a => a.elementTag === 'input');
        expect(emailInput).toBeDefined();
        expect(emailInput?.actionType).toBe('fill');
    });
});
