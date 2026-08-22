import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface CareConfig {
    targetUrl: string;
    allowedDomains: string[];
    exclusions: string[];
    depthLimit: number;
    maxPages: number;
    safetyLevel: 'safe_read_only' | 'full_crud';
    storageStatePath?: string;
    consecutivePassingRunsRequired: number;
    git: {
        autoPr: boolean;
        baseBranch: string;
        branchPrefix: string;
    };
}

export const DEFAULT_CARE_CONFIG: CareConfig = {
    targetUrl: process.env.TARGET_URL || 'https://quickexamcreator.com',
    allowedDomains: [],
    exclusions: ['/logout', '/sign-out', '/delete', '/api/auth/logout'],
    depthLimit: 2,
    maxPages: 10,
    safetyLevel: 'safe_read_only',
    consecutivePassingRunsRequired: 3,
    git: {
        autoPr: false,
        baseBranch: 'main',
        branchPrefix: 'care/auto-regression-'
    }
};

export function loadCareConfig(configPath?: string): CareConfig {
    if (configPath && fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, 'utf-8');
            let parsed: any;
            if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
                parsed = yaml.load(raw) || {};
            } else {
                parsed = JSON.parse(raw);
            }
            const merged = { ...DEFAULT_CARE_CONFIG, ...parsed };
            if (!merged.allowedDomains || merged.allowedDomains.length === 0) {
                try {
                    merged.allowedDomains = [new URL(merged.targetUrl).hostname];
                } catch {
                    merged.allowedDomains = [];
                }
            }
            return merged;
        } catch (e) {
            console.warn(`Failed to parse config at ${configPath}: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    const host = new URL(DEFAULT_CARE_CONFIG.targetUrl).hostname;
    return {
        ...DEFAULT_CARE_CONFIG,
        allowedDomains: [host]
    };
}
