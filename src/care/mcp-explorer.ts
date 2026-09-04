import * as playwright from 'playwright';

import { CareConfig, DiscoveredAction, DiscoveredFlowTrace } from './types';

export class MCPBrowserExplorer {
  private browser: playwright.Browser | null = null;

  async init(headless = true): Promise<void> {
    this.browser = await playwright.chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Explores the target URL and discovers key interactive workflows
   */
  async exploreUrl(targetUrl: string, config: Partial<CareConfig> = {}): Promise<DiscoveredFlowTrace[]> {
    if (!this.browser) {
      await this.init();
    }

    const traces: DiscoveredFlowTrace[] = [];
    const context = await this.browser!.newContext();
    const page = await context.newPage();

    try {
      console.log(`🔍 [CARE MCP Explorer] Navigating to: ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);

      const pageTitle = await page.title();
      const currentUrl = page.url();

      // Dismiss cookie banners if present
      const cookieButtons = page.locator('button:has-text("Accept"), button:has-text("Agree"), button:has-text("Got it"), #btn-accept-cookie');
      if (await cookieButtons.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await cookieButtons.first().click().catch(() => {});
      }

      // 1. Discover Primary Landing Flow
      const landingActions: DiscoveredAction[] = [
        {
          type: 'navigate',
          selector: targetUrl,
          description: `User navigates to "${targetUrl}"`
        }
      ];

      // Discover interactive primary inputs or buttons
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="search"], textarea');
      const inputCount = await inputs.count();
      for (let i = 0; i < Math.min(inputCount, 2); i++) {
        const input = inputs.nth(i);
        const name = (await input.getAttribute('name')) || (await input.getAttribute('placeholder')) || (await input.getAttribute('id')) || `input-${i}`;
        landingActions.push({
          type: 'fill',
          selector: name.startsWith('#') ? name : `[placeholder="${name}"]`,
          name,
          value: 'Sample Automated Input',
          description: `User enters "Sample Automated Input" into ${name}`
        });
      }

      const buttons = page.locator('button:visible, a.btn:visible, input[type="submit"]:visible');
      const buttonCount = await buttons.count();
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const btn = buttons.nth(i);
        const text = (await btn.textContent())?.trim() || 'Action Button';
        const role = await btn.getAttribute('role') || 'button';
        landingActions.push({
          type: 'click',
          selector: `button:has-text("${text}")`,
          role,
          name: text,
          description: `User clicks "${text}" button`
        });
      }

      const flowSlug = (pageTitle || 'landing_page').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
      traces.push({
        flowName: `${flowSlug}_interactive_flow`,
        entryUrl: currentUrl,
        pageTitle: pageTitle || 'Landing Page',
        actions: landingActions,
        expectedOutcome: 'Target elements and key views should be visible and verified'
      });

    } catch (err: any) {
      console.warn(`⚠️ [CARE MCP Explorer] Navigation error: ${err.message}`);
    } finally {
      await context.close();
    }

    return traces;
  }
}
