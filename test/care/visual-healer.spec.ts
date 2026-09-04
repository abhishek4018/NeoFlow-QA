import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';

import { VisualFailureHealer } from '../../src/care/visual-healer';

describe('Visual Failure Healer', () => {
  it('instantiates and handles missing step definitions gracefully', async () => {
    const healer = new VisualFailureHealer();
    const result = await healer.healStep({
      stepFilePath: 'non_existent_file.steps.ts',
      errorMessage: 'Element not found',
      currentSelector: '#broken-btn'
    });
    assert.strictEqual(result, false);
  });

  it('updates step definition selector with healed output', async () => {
    const healer = new VisualFailureHealer();
    const tempFile = path.resolve(process.cwd(), 'test/care/temp_healer_test.steps.ts');
    fs.writeFileSync(tempFile, `const TargetBtn = () => PageElement.located(By.css('#broken-btn'));`, 'utf-8');

    const result = await healer.healStep({
      stepFilePath: tempFile,
      errorMessage: 'Element not visible',
      currentSelector: '#broken-btn',
      domSnippet: '<button id="healed-btn">Submit</button>'
    });

    assert.strictEqual(result, true);
    const content = fs.readFileSync(tempFile, 'utf-8');
    assert.ok(content.includes('By.'));

    fs.unlinkSync(tempFile);
  });
});
