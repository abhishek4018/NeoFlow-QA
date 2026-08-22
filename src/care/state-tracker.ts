import * as crypto from 'crypto';

import { SPKBDb } from '../spkb/db';

export interface FlowMetadata {
    flowName: string;
    flowSignature: string;
    featurePath: string;
    stepsPath: string;
}

export class StateTracker {
    private db: SPKBDb;

    constructor(db: SPKBDb) {
        this.db = db;
        this.initSchema();
    }

    private initSchema(): void {
        const rawDb = (this.db as any).db;
        if (rawDb) {
            rawDb.exec(`
                CREATE TABLE IF NOT EXISTS care_flows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    flow_name TEXT UNIQUE,
                    flow_signature TEXT UNIQUE,
                    feature_path TEXT,
                    steps_path TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }
    }

    public computeSignature(url: string, actions: Array<{ type: string; selector: string }>): string {
        const content = `${url}::` + actions.map(a => `${a.type}:${a.selector}`).join('|');
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    public isFlowCovered(flowSignature: string): boolean {
        const rawDb = (this.db as any).db;
        if (!rawDb) return false;
        const row = rawDb.prepare(`SELECT id FROM care_flows WHERE flow_signature = ?`).get(flowSignature);
        return !!row;
    }

    public recordVerifiedFlow(flow: FlowMetadata): void {
        const rawDb = (this.db as any).db;
        if (!rawDb) return;
        rawDb.prepare(`
            INSERT OR REPLACE INTO care_flows (flow_name, flow_signature, feature_path, steps_path, last_verified_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(flow.flowName, flow.flowSignature, flow.featurePath, flow.stepsPath);
    }
}
