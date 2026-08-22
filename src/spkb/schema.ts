export const INITIAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS page_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    title TEXT,
    route_path TEXT NOT NULL,
    discovered_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('unexplored', 'exploring', 'explored', 'error'))
);

CREATE TABLE IF NOT EXISTS transition_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_node_id INTEGER NOT NULL,
    to_node_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    target_selector TEXT NOT NULL,
    action_label TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    FOREIGN KEY(from_node_id) REFERENCES page_nodes(id),
    FOREIGN KEY(to_node_id) REFERENCES page_nodes(id)
);

CREATE TABLE IF NOT EXISTS system_invariants (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    target_scope TEXT NOT NULL,
    expression TEXT
);

CREATE TABLE IF NOT EXISTS invariant_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invariant_id TEXT NOT NULL,
    page_node_id INTEGER,
    observed_at TEXT NOT NULL,
    details TEXT NOT NULL,
    screenshot_path TEXT,
    telemetry_json TEXT,
    FOREIGN KEY(invariant_id) REFERENCES system_invariants(id),
    FOREIGN KEY(page_node_id) REFERENCES page_nodes(id)
);

CREATE TABLE IF NOT EXISTS care_flows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flow_name TEXT UNIQUE,
    flow_signature TEXT UNIQUE,
    feature_path TEXT,
    steps_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
