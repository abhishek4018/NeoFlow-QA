import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as fs from 'fs';
import * as path from 'path';

import { StateTracker } from '../../src/care/state-tracker';
import { SPKBDb } from '../../src/spkb/db';

describe('StateTracker Deduplication', () => {
    const testDbPath = path.resolve(__dirname, 'test-care-state.db');

    it('identifies new flows and avoids duplicate generation', () => {
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
        const db = new SPKBDb(testDbPath);
        const tracker = new StateTracker(db);

        const flowSig = 'hash-of-search-action-sequence';
        assert.strictEqual(tracker.isFlowCovered(flowSig), false);

        tracker.recordVerifiedFlow({
            flowName: 'search_product',
            flowSignature: flowSig,
            featurePath: 'features/codegen/search_product.feature',
            stepsPath: 'step-definitions/codegen/search_product.steps.ts'
        });

        assert.strictEqual(tracker.isFlowCovered(flowSig), true);
        db.close();
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    });

    it('computes deterministic flow signatures', () => {
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
        const db = new SPKBDb(testDbPath);
        const tracker = new StateTracker(db);

        const actions = [
            { type: 'click', selector: '#login-btn' },
            { type: 'fill', selector: '#username' }
        ];

        const sig1 = tracker.computeSignature('https://example.com/login', actions);
        const sig2 = tracker.computeSignature('https://example.com/login', actions);
        const sig3 = tracker.computeSignature('https://example.com/other', actions);

        assert.strictEqual(typeof sig1, 'string');
        assert.strictEqual(sig1.length, 64);
        assert.strictEqual(sig1, sig2);
        assert.notStrictEqual(sig1, sig3);

        db.close();
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    });
});
