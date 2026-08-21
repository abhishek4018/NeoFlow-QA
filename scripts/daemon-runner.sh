#!/usr/bin/env bash
set -e

INTERVAL_SECONDS=${DAEMON_INTERVAL_SECONDS:-3600}
TARGET_URL=${TARGET_URL:-"https://quickexamcreator.com"}

echo "========================================================"
echo "  🚀 NeoFlow Autonomous Quality Engine (AQE) Daemon"
echo "  🌐 Target URL: $TARGET_URL"
echo "  ⏱️  Interval: $INTERVAL_SECONDS seconds"
echo "========================================================"

while true; do
  echo ""
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting exploration & invariant sweep..."
  
  # 1. Run Autonomous Discovery & SPKB Mapping
  npx ts-node src/cli/neoflow.ts "$TARGET_URL" || true

  # 2. Execute Full Serenity/JS BDD Regression Suite
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running Serenity/JS regression suite..."
  npx cucumber-js --profile default || true

  # 3. Generate Serenity HTML Report
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Compiling Serenity BDD HTML Report..."
  npm run test:report || true

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cycle complete. Sleeping for $INTERVAL_SECONDS seconds..."
  sleep "$INTERVAL_SECONDS"
done
