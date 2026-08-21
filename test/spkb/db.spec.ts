import { test, expect } from '@playwright/test';
import { SPKBDb } from '../../src/spkb/db';
import { SystemInvariant } from '../../src/spkb/types';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Single Point Knowledge Base (SPKB) Database Engine', () => {
    const testDbPath = path.join(__dirname, 'test_spkb.db');

    test.beforeEach(() => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    test.afterEach(() => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    test('initializes schema and registers page nodes and transition edges', () => {
        const spkb = new SPKBDb(testDbPath);

        // 1. Register Page Node
        const homeNode = spkb.insertPageNode({
            url: 'https://quickexamcreator.com/',
            title: 'Vatra Assess',
            routePath: '/',
            discoveredAt: new Date().toISOString(),
            status: 'explored'
        });
        expect(homeNode.id).toBeDefined();

        const guidesNode = spkb.insertPageNode({
            url: 'https://quickexamcreator.com/guides',
            title: 'Exam Guides',
            routePath: '/guides',
            discoveredAt: new Date().toISOString(),
            status: 'unexplored'
        });
        expect(guidesNode.id).toBeDefined();

        // 2. Register Transition Edge
        const edge = spkb.insertTransitionEdge({
            fromNodeId: homeNode.id,
            toNodeId: guidesNode.id,
            actionType: 'click',
            targetSelector: "//nav//a[text()='Guides']",
            actionLabel: 'Click Guides link',
            weight: 1.0
        });
        expect(edge.id).toBeDefined();

        // 3. Query Unexplored Frontier
        const frontier = spkb.getUnexploredFrontier();
        expect(frontier.length).toBe(1);
        expect(frontier[0].routePath).toBe('/guides');
    });

    test('registers systemic invariants and queries violated invariants', () => {
        const spkb = new SPKBDb(testDbPath);

        const invariant: SystemInvariant = {
            id: 'INV_CONSOLE_001',
            type: 'NO_CONSOLE_ERRORS',
            description: 'Zero uncaught JavaScript exceptions during page interaction',
            severity: 'CRITICAL',
            targetScope: 'GLOBAL'
        };

        spkb.registerInvariant(invariant);

        const activeInvariants = spkb.getInvariants('GLOBAL');
        expect(activeInvariants.length).toBe(1);
        expect(activeInvariants[0].id).toBe('INV_CONSOLE_001');
    });
});
