import { InvariantViolation, SystemInvariant, TelemetryEvent } from './types';

export class InvariantsEngine {
    public static readonly DEFAULT_INVARIANTS: SystemInvariant[] = [
        {
            id: 'INV_SYS_001',
            type: 'NO_CONSOLE_ERRORS',
            description: 'Zero unhandled console error exceptions',
            severity: 'CRITICAL',
            targetScope: 'GLOBAL'
        },
        {
            id: 'INV_SYS_002',
            type: 'HTTP_SUCCESS',
            description: 'Zero HTTP 4xx or 5xx response codes on key routes and APIs',
            severity: 'HIGH',
            targetScope: 'GLOBAL'
        }
    ];

    public evaluateEvents(events: TelemetryEvent[], pageNodeId?: number): InvariantViolation[] {
        const violations: InvariantViolation[] = [];

        for (const event of events) {
            if (event.type === 'console' && event.level === 'error') {
                violations.push({
                    invariantId: 'INV_SYS_001',
                    pageNodeId,
                    observedAt: event.timestamp,
                    details: `Console error detected: ${event.message}`,
                    telemetryJson: JSON.stringify(event)
                });
            } else if (event.type === 'network' && event.status >= 400) {
                violations.push({
                    invariantId: 'INV_SYS_002',
                    pageNodeId,
                    observedAt: event.timestamp,
                    details: `HTTP ${event.status} error detected requesting: ${event.url}`,
                    telemetryJson: JSON.stringify(event)
                });
            }
        }

        return violations;
    }
}
