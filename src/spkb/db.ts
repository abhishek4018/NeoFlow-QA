import Database from 'better-sqlite3';

import { INITIAL_SCHEMA } from './schema';
import { InvariantViolation,PageNode, SystemInvariant, TransitionEdge } from './types';

export class SPKBDb {
    private db: Database.Database;

    constructor(dbPath: string = 'spkb.db') {
        this.db = new Database(dbPath);
        this.initialize();
    }

    private initialize(): void {
        this.db.exec(INITIAL_SCHEMA);
    }

    public insertPageNode(node: PageNode): PageNode {
        const stmt = this.db.prepare(`
            INSERT INTO page_nodes (url, title, route_path, discovered_at, status)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(url) DO UPDATE SET
                title=excluded.title,
                status=excluded.status
            RETURNING id
        `);
        const row = stmt.get(node.url, node.title, node.routePath, node.discoveredAt, node.status) as { id: number };
        return { ...node, id: row?.id || node.id };
    }

    public insertTransitionEdge(edge: TransitionEdge): TransitionEdge {
        const stmt = this.db.prepare(`
            INSERT INTO transition_edges (from_node_id, to_node_id, action_type, target_selector, action_label, weight)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            edge.fromNodeId,
            edge.toNodeId,
            edge.actionType,
            edge.targetSelector,
            edge.actionLabel,
            edge.weight
        );
        return { ...edge, id: Number(info.lastInsertRowid) };
    }

    public getUnexploredFrontier(): PageNode[] {
        const stmt = this.db.prepare(`
            SELECT id, url, title, route_path as routePath, discovered_at as discoveredAt, status
            FROM page_nodes
            WHERE status = 'unexplored'
        `);
        return stmt.all() as PageNode[];
    }

    public markPageExplored(url: string): void {
        this.db.prepare(`UPDATE page_nodes SET status = 'explored' WHERE url = ? OR url = ?`).run(url, url.endsWith('/') ? url.slice(0, -1) : url + '/');
    }

    public registerInvariant(invariant: SystemInvariant): void {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO system_invariants (id, type, description, severity, target_scope, expression)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            invariant.id,
            invariant.type,
            invariant.description,
            invariant.severity,
            invariant.targetScope,
            invariant.expression || null
        );
    }

    public getInvariants(scope: string = 'GLOBAL'): SystemInvariant[] {
        const stmt = this.db.prepare(`
            SELECT id, type, description, severity, target_scope as targetScope, expression
            FROM system_invariants
            WHERE target_scope = ? OR target_scope = 'GLOBAL'
        `);
        return stmt.all(scope) as SystemInvariant[];
    }

    public recordViolation(violation: InvariantViolation): void {
        const stmt = this.db.prepare(`
            INSERT INTO invariant_violations (invariant_id, page_node_id, observed_at, details, screenshot_path, telemetry_json)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            violation.invariantId,
            violation.pageNodeId || null,
            violation.observedAt,
            violation.details,
            violation.screenshotPath || null,
            violation.telemetryJson || null
        );
    }

    public close(): void {
        this.db.close();
    }
}
