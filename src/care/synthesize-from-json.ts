import * as fs from 'fs';
import * as path from 'path';
import { BDDSynthesizer } from './synthesizer';
import { DiscoveredFlowTrace } from './types';

async function main() {
  const jsonPath = process.argv[2];

  if (!jsonPath) {
    console.error('Usage: ts-node synthesize-from-json.ts <path-to-json>');
    process.exit(1);
  }

  try {
    const trace: DiscoveredFlowTrace = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const synthesizer = new BDDSynthesizer();
    const { featurePath, stepDefPath } = synthesizer.synthesizeFlow(trace);
    console.log(JSON.stringify({ success: true, featurePath, stepDefPath }));
  } catch (error: any) {
    console.error(`Error synthesizing flow: ${error.message}`);
    console.log(JSON.stringify({ success: false, error: error.message }));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
