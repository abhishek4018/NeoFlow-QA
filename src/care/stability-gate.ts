import { execSync } from "child_process";

export interface StabilityResult {
    passed: boolean;
    consecutivePasses: number;
    totalAttempts: number;
    errorSummary?: string;
}

export class StabilityGate {
    public async verifyStability(tagName: string, requiredPasses: number = 3): Promise<StabilityResult> {
        let consecutivePasses = 0;
        let totalAttempts = 0;
        const maxAttempts = requiredPasses + 2; // Allow up to 2 self-healing retries

        while (consecutivePasses < requiredPasses && totalAttempts < maxAttempts) {
            totalAttempts++;
            try {
                execSync(`npx cucumber-js --profile default --tags "@${tagName}"`, {
                    stdio: "pipe",
                    timeout: 60000
                });
                consecutivePasses++;
            } catch (err: any) {
                const error = err?.stdout?.toString() || err?.stderr?.toString() || err?.message;
                return {
                    passed: false,
                    consecutivePasses,
                    totalAttempts,
                    errorSummary: error ? error.slice(0, 400) : "Test run failed"
                };
            }
        }

        return {
            passed: consecutivePasses >= requiredPasses,
            consecutivePasses,
            totalAttempts
        };
    }

    public async verifyMock(requiredPasses: number, willPass: boolean): Promise<StabilityResult> {
        return {
            passed: willPass,
            consecutivePasses: willPass ? requiredPasses : 0,
            totalAttempts: requiredPasses
        };
    }
}
