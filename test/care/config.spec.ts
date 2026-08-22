import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';

import { loadCareConfig } from '../../src/care/config';

describe('CARE Config Loader', () => {
    it('loads default configuration when no file provided', () => {
        const config = loadCareConfig();
        assert.ok(config.targetUrl);
        assert.strictEqual(config.safetyLevel, 'safe_read_only');
        assert.ok(Array.isArray(config.allowedDomains));
        assert.strictEqual(config.depthLimit, 2);
        assert.strictEqual(config.maxPages, 10);
        assert.strictEqual(config.consecutivePassingRunsRequired, 3);
        assert.strictEqual(config.git.autoPr, false);
        assert.strictEqual(config.git.baseBranch, 'main');
    });

    it('validates allowed domains and route exclusions', () => {
        const config = loadCareConfig();
        assert.ok(config.exclusions.length > 0);
        assert.ok(config.exclusions.includes('/logout'));
        assert.ok(config.allowedDomains.length > 0);
    });

    it('loads custom configuration from json file', () => {
        const tmpPath = path.resolve(__dirname, 'temp-care-config.json');
        const customConfig = {
            targetUrl: 'https://example.com/app',
            safetyLevel: 'full_crud',
            depthLimit: 5,
            maxPages: 25
        };
        fs.writeFileSync(tmpPath, JSON.stringify(customConfig), 'utf-8');
        try {
            const config = loadCareConfig(tmpPath);
            assert.strictEqual(config.targetUrl, 'https://example.com/app');
            assert.strictEqual(config.safetyLevel, 'full_crud');
            assert.strictEqual(config.depthLimit, 5);
            assert.strictEqual(config.maxPages, 25);
            assert.strictEqual(config.git.baseBranch, 'main');
        } finally {
            if (fs.existsSync(tmpPath)) {
                fs.unlinkSync(tmpPath);
            }
        }
    });

    it('falls back to defaults when config file is invalid', () => {
        const tmpPath = path.resolve(__dirname, 'invalid-care-config.json');
        fs.writeFileSync(tmpPath, 'not valid json', 'utf-8');
        try {
            const config = loadCareConfig(tmpPath);
            assert.strictEqual(config.safetyLevel, 'safe_read_only');
        } finally {
            if (fs.existsSync(tmpPath)) {
                fs.unlinkSync(tmpPath);
            }
        }
    });
});
