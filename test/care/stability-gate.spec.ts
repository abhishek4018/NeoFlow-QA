import assert from 'node:assert';
import { describe, it } from 'node:test';

import { StabilityGate } from '../../src/care/stability-gate';

describe('Stability Gate', () => {
    it('executes verification runs and tracks pass counts', async () => {
        const gate = new StabilityGate();
        // Test with a mock runner
        const result = await gate.verifyMock(3, true);
        assert.strictEqual(result.passed, true);
        assert.strictEqual(result.consecutivePasses, 3);
    });

    it('fails when a run fails in the barrier', async () => {
        const gate = new StabilityGate();
        const result = await gate.verifyMock(3, false);
        assert.strictEqual(result.passed, false);
    });
});
