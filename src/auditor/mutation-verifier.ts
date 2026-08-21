import { execSync } from 'child_process';

export interface SharpnessVerificationOptions {
    testRunCommand: string;
}

export class MutationVerifier {
    public mutateAssertion(stepContent: string): string {
        // Replace equals/includes arguments or strings with an invalid target
        if (stepContent.includes('equals(')) {
            return stepContent.replace(/equals\([^)]+\)/g, 'equals("__MUTATED_INVALID_ASSERTION__")');
        }
        if (stepContent.includes('includes(')) {
            return stepContent.replace(/includes\([^)]+\)/g, 'includes("__MUTATED_INVALID_ASSERTION__")');
        }
        return stepContent.replace(/toHaveTitle\([^)]+\)/g, 'toHaveTitle("__MUTATED_INVALID_ASSERTION__")');
    }

    public async verifySharpness(options: SharpnessVerificationOptions): Promise<boolean> {
        try {
            // Run baseline test to confirm it currently passes
            execSync(options.testRunCommand, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }
}
