import assert from 'node:assert';
import * as fs from 'node:fs';
import { describe, it } from 'node:test';

import { BDDSynthesizer } from '../../src/care/synthesizer';
import { DiscoveredFlowTrace } from '../../src/care/types';

describe('BDD Synthesizer', () => {
  it('synthesizes feature and step definition files cleanly', () => {
    const synthesizer = new BDDSynthesizer();
    const sampleTrace: DiscoveredFlowTrace = {
      flowName: 'test_sample_flow',
      entryUrl: 'https://example.com',
      pageTitle: 'Example Domain',
      actions: [
        { type: 'navigate', selector: 'https://example.com', description: 'Navigate to page' }
      ],
      expectedOutcome: 'Page should be visible'
    };

    const result = synthesizer.synthesizeFlow(sampleTrace);
    assert.ok(fs.existsSync(result.featurePath));
    assert.ok(fs.existsSync(result.stepDefPath));

    // Clean up test generated files
    fs.unlinkSync(result.featurePath);
    fs.unlinkSync(result.stepDefPath);
  });
});
