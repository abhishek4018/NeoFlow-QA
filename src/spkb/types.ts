export type PageStatus = 'unexplored' | 'exploring' | 'explored' | 'error';
export type InvariantSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type InvariantType = 'NO_CONSOLE_ERRORS' | 'HTTP_SUCCESS' | 'CONTAINER_RENDER' | 'DATA_CONTRACT';

export interface PageNode {
    id?: number;
    url: string;
    title: string;
    routePath: string;
    discoveredAt: string;
    status: PageStatus;
}

export interface TransitionEdge {
    id?: number;
    fromNodeId: number;
    toNodeId: number;
    actionType: 'click' | 'fill' | 'navigate' | 'select' | 'submit';
    targetSelector: string;
    actionLabel: string;
    weight: number;
}

export interface SystemInvariant {
    id: string;
    type: InvariantType;
    description: string;
    severity: InvariantSeverity;
    targetScope: 'GLOBAL' | string; // GLOBAL or specific routePath
    expression?: string;
}

export interface InvariantViolation {
    id?: number;
    invariantId: string;
    pageNodeId?: number;
    observedAt: string;
    details: string;
    screenshotPath?: string;
    telemetryJson?: string;
}

export type TelemetryEvent =
    | { type: 'console'; level: 'log' | 'info' | 'warn' | 'error'; message: string; timestamp: string }
    | { type: 'network'; status: number; url: string; timestamp: string };

