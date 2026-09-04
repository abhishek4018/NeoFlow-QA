import assert from 'node:assert';
import { describe, it } from 'node:test';

import { resolveAIProvider } from '../../src/ai/client';

describe('AI Client Provider Resolution', () => {
  it('defaults to vertex when AI_PROVIDER is not set', () => {
    delete process.env.AI_PROVIDER;
    assert.strictEqual(resolveAIProvider(), 'vertex');
  });

  it('resolves to hermes when specified', () => {
    process.env.AI_PROVIDER = 'hermes';
    assert.strictEqual(resolveAIProvider(), 'hermes');
  });

  it('handles case-insensitive provider names', () => {
    process.env.AI_PROVIDER = 'HERMES';
    assert.strictEqual(resolveAIProvider(), 'hermes');
    process.env.AI_PROVIDER = 'VeRtEx';
    assert.strictEqual(resolveAIProvider(), 'vertex');
  });
});
