import assert from 'node:assert';
import { describe, it } from 'node:test';

import { PRPublisher } from '../../src/care/pr-publisher';

describe('PR Publisher', () => {
    it('generates formatted markdown PR summary with flow details', () => {
        const publisher = new PRPublisher({ dryRun: true });
        const summary = publisher.formatPRBody([
            {
                flowName: 'checkout_flow',
                flowSignature: 'sig123',
                featurePath: 'features/codegen/checkout_flow.feature',
                stepsPath: 'step-definitions/codegen/checkout_flow.steps.ts'
            }
        ], '3/3 runs passed (100% stable)');

        assert.ok(summary.includes('checkout_flow'));
        assert.ok(summary.includes('3/3 runs passed'));
    });

    it('returns empty result when publishing 0 flows', async () => {
        const publisher = new PRPublisher({ dryRun: true });
        const result = await publisher.publishRegressionPR([], '3/3 runs passed');
        assert.strictEqual(result.branchCreated, '');
        assert.strictEqual(result.prCreated, false);
    });

    it('creates dry-run PR with expected branch and url', async () => {
        const publisher = new PRPublisher({ dryRun: true, branchPrefix: 'test/prefix-' });
        const result = await publisher.publishRegressionPR([
            {
                flowName: 'login_flow',
                flowSignature: 'sig456',
                featurePath: 'features/codegen/login_flow.feature',
                stepsPath: 'step-definitions/codegen/login_flow.steps.ts'
            }
        ], '3/3 runs passed (100% stable)');

        assert.strictEqual(result.prCreated, true);
        assert.ok(result.branchCreated.startsWith('test/prefix-'));
        assert.strictEqual(result.prUrl, 'https://github.com/dry-run/pull/1');
    });
});
