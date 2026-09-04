import * as fs from 'fs';
import * as path from 'path';

import { healLocatorWithVision } from '../ai/client';

export interface HealStepOptions {
  stepFilePath: string;
  errorMessage: string;
  currentSelector: string;
  domSnippet?: string;
  screenshotDirectory?: string;
}

export class VisualFailureHealer {
  /**
   * Automatically heals a failing step definition by querying AI with DOM snapshot & screenshot
   */
  async healStep(options: HealStepOptions): Promise<boolean> {
    if (!fs.existsSync(options.stepFilePath)) {
      console.warn(`⚠️ [CARE Healer] Step definition file not found: ${options.stepFilePath}`);
      return false;
    }

    let screenshotBuffer: Buffer | undefined;
    const screenshotDir = options.screenshotDirectory || path.resolve(process.cwd(), 'target/site/serenity');
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
      if (files.length > 0) {
        const latestScreenshot = path.join(screenshotDir, files[files.length - 1]);
        screenshotBuffer = fs.readFileSync(latestScreenshot);
        console.log(`📸 [CARE Healer] Loaded failure screenshot: ${latestScreenshot}`);
      }
    }

    console.log(`🩺 [CARE Healer] Diagnosing broken selector: "${options.currentSelector}"`);
    const healedResult = await healLocatorWithVision({
      screenshotBuffer,
      domSnippet: options.domSnippet || '<body><div id="main-content"></div></body>',
      errorMessage: options.errorMessage,
      currentSelector: options.currentSelector
    });

    console.log(`✅ [CARE Healer] Healed selector proposed: ${healedResult.selectorType} -> "${healedResult.selectorValue}" (${healedResult.explanation})`);

    // Replace the locator in the step definition file
    const fileContent = fs.readFileSync(options.stepFilePath, 'utf-8');
    let replacement = `By.css('${healedResult.selectorValue}')`;
    if (healedResult.selectorType === 'id') {
      replacement = `By.id('${healedResult.selectorValue.replace(/^#/, '')}')`;
    } else if (healedResult.selectorType === 'xpath') {
      replacement = `By.xpath('${healedResult.selectorValue}')`;
    }

    const regex = new RegExp(`By\\.(css|id|xpath|role)\\(['"\`][^'"\`]+['"\`]\\)`, 'g');
    const updatedContent = fileContent.replace(regex, replacement);

    fs.writeFileSync(options.stepFilePath, updatedContent, 'utf-8');
    console.log(`💾 [CARE Healer] Successfully updated step definition: ${options.stepFilePath}`);

    return true;
  }
}
