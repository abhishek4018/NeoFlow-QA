import { execSync } from 'child_process';

import { FlowMetadata } from './state-tracker';

export interface PRPublisherOptions {
    dryRun?: boolean;
    baseBranch?: string;
    branchPrefix?: string;
}

export interface PRResult {
    branchCreated: string;
    prCreated: boolean;
    prUrl?: string;
}

export class PRPublisher {
    private options: PRPublisherOptions;

    constructor(options: PRPublisherOptions = {}) {
        this.options = {
            dryRun: options.dryRun ?? false,
            baseBranch: options.baseBranch || 'main',
            branchPrefix: options.branchPrefix || 'care/auto-regression-'
        };
    }

    public formatPRBody(flows: FlowMetadata[], stabilityMetrics: string): string {
        const flowList = flows.map(f => `- **\`${f.flowName}\`**\n  - Feature: \`${f.featurePath}\`\n  - Step Definitions: \`${f.stepsPath}\``).join('\n');
        return `## 🤖 Automated Regression Suite Enhancement (CARE)

This PR was autonomously synthesized and verified by the **Continuous Autonomous Regression Engine (CARE)**.

### 📊 Stability & Verification Metrics
- **Verification Gate**: ${stabilityMetrics}
- **Framework**: Serenity/JS Screenplay + Cucumber.js BDD + Playwright

### 🧭 New & Enhanced Regression Scenarios (${flows.length})
${flowList}

---
*Generated automatically by CARE. Please review the living documentation feature files above.*`;
    }

    public async publishRegressionPR(flows: FlowMetadata[], stabilityMetrics: string): Promise<PRResult> {
        if (flows.length === 0) {
            return { branchCreated: '', prCreated: false };
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const branchName = `${this.options.branchPrefix}${timestamp}`;

        if (this.options.dryRun) {
            console.log(`[DRY-RUN] Would create branch ${branchName} and open PR with ${flows.length} flows.`);
            return { branchCreated: branchName, prCreated: true, prUrl: 'https://github.com/dry-run/pull/1' };
        }

        try {
            execSync(`git checkout -b ${branchName}`);
            execSync(`git add features/codegen/*.feature step-definitions/codegen/*.steps.ts spkb.db`);
            execSync(`git diff --cached --quiet || git commit -m "feat(regression): add ${flows.length} verified BDD flows from CARE"`);
            execSync(`git push -u origin ${branchName}`);

            const title = `feat(care): automated regression suite update (${flows.length} flows)`;
            const body = this.formatPRBody(flows, stabilityMetrics);
            const prOutput = execSync(`gh pr create --base ${this.options.baseBranch} --head ${branchName} --title "${title}" --body "${body}"`, { encoding: 'utf-8' });

            return {
                branchCreated: branchName,
                prCreated: true,
                prUrl: prOutput.trim()
            };
        } catch (error: any) {
            console.error('Error opening PR via Git/GH CLI:', error?.message);
            return { branchCreated: branchName, prCreated: false };
        }
    }
}
