export interface LintResult {
    valid: boolean;
    errors: string[];
}

export class ASTAssertionLinter {
    public lint(code: string): LintResult {
        const errors: string[] = [];

        // 1. Check for loose isPresent() assertions
        if (code.includes('isPresent()')) {
            errors.push('Forbidden loose assertion "isPresent()" without visibility or state validation');
        }

        // 2. Check for empty catch blocks
        const emptyCatchRegex = /catch\s*\([^\)]*\)\s*\{[\s\n\r]*(\/\/[^\n]*|\/\*[\s\S]*?\*\/)?[\s\n\r]*\}/m;
        if (emptyCatchRegex.test(code)) {
            errors.push('Forbidden empty catch block detected; silent test passing is not permitted');
        }

        // 3. Check for hardcoded sleeps
        if (code.includes('waitForTimeout(') || code.includes('setTimeout(')) {
            errors.push('Forbidden hardcoded sleep "waitForTimeout()" detected; use event-driven synchronization');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
