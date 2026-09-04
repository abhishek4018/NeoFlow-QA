import { MCPBrowserExplorer } from './mcp-explorer';
import { BDDSynthesizer } from './synthesizer';

async function runAutonomousCycle(targetUrl?: string) {
  const url = targetUrl || process.env.BASE_URL || 'https://example.com';
  console.log(`\n==================================================`);
  console.log(`🚀 [CARE Autonomous Engine] Starting exploration on: ${url}`);
  console.log(`==================================================\n`);

  const explorer = new MCPBrowserExplorer();
  const synthesizer = new BDDSynthesizer();

  try {
    const traces = await explorer.exploreUrl(url);
    if (traces.length === 0) {
      console.log(`ℹ️ [CARE] No interactive workflows discovered.`);
      return;
    }

    for (const trace of traces) {
      console.log(`\n📝 [CARE] Synthesizing BDD assets for flow: "${trace.flowName}"`);
      const { featurePath, stepDefPath } = synthesizer.synthesizeFlow(trace);
      console.log(`✅ [CARE] Ready: Feature [${featurePath}] | Steps [${stepDefPath}]`);
    }

    console.log(`\n✨ [CARE] Autonomous exploration and synthesis completed successfully.`);
  } catch (err: any) {
    console.error(`❌ [CARE] Autonomous cycle encountered error: ${err.message}`);
  } finally {
    await explorer.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isOnce = args.includes('--once') || args.includes('--explore');
  const targetUrlArg = args.find(a => a.startsWith('http://') || a.startsWith('https://'));

  if (isOnce) {
    await runAutonomousCycle(targetUrlArg);
  } else {
    console.log(`🔄 [CARE Daemon] Starting continuous daemon (Interval: 10m)...`);
    await runAutonomousCycle(targetUrlArg);

    setInterval(async () => {
      await runAutonomousCycle(targetUrlArg);
    }, 10 * 60 * 1000);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
