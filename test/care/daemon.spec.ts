import assert from 'node:assert';
import { describe, it } from 'node:test';

import { CareDaemon } from '../../src/care/daemon';

describe('CARE Daemon', () => {
    it('initializes daemon with default intervals', () => {
        const daemon = new CareDaemon({ intervalMinutes: 60 });
        assert.ok(daemon);
    });

    it('initializes daemon with custom options and once mode', () => {
        const daemon = new CareDaemon({ once: true, intervalMinutes: 120 });
        assert.ok(daemon);
    });
});
