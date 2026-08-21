import { test, expect } from '@playwright/test';
import { InvariantsEngine } from '../../src/spkb/invariants-engine';
import { TelemetryEvent } from '../../src/spkb/types';

test.describe('Invariants Engine & Telemetry Monitor', () => {
    test('detects and flags unhandled console errors as violations', () => {
        const engine = new InvariantsEngine();

        const events: TelemetryEvent[] = [
            { type: 'console', level: 'info', message: 'Page loaded successfully', timestamp: new Date().toISOString() },
            { type: 'console', level: 'error', message: 'Uncaught TypeError: Cannot read properties of undefined', timestamp: new Date().toISOString() }
        ];

        const violations = engine.evaluateEvents(events);
        expect(violations.length).toBe(1);
        expect(violations[0].invariantId).toBe('INV_SYS_001');
        expect(violations[0].details).toContain('Uncaught TypeError');
    });

    test('detects HTTP 4xx and 5xx network failures as violations', () => {
        const engine = new InvariantsEngine();

        const events: TelemetryEvent[] = [
            { type: 'network', status: 200, url: 'https://quickexamcreator.com/api/health', timestamp: new Date().toISOString() },
            { type: 'network', status: 500, url: 'https://quickexamcreator.com/api/exams', timestamp: new Date().toISOString() }
        ];

        const violations = engine.evaluateEvents(events);
        expect(violations.length).toBe(1);
        expect(violations[0].invariantId).toBe('INV_SYS_002');
        expect(violations[0].details).toContain('500');
    });

    test('evaluates clean telemetry without raising violations', () => {
        const engine = new InvariantsEngine();

        const events: TelemetryEvent[] = [
            { type: 'console', level: 'info', message: 'Initializing components', timestamp: new Date().toISOString() },
            { type: 'network', status: 200, url: 'https://quickexamcreator.com/guides', timestamp: new Date().toISOString() }
        ];

        const violations = engine.evaluateEvents(events);
        expect(violations.length).toBe(0);
    });
});
