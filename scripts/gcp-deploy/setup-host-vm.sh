#!/usr/bin/env bash
set -euo pipefail

echo "========================================================="
echo "🛠️ Bootstrapping GCP Compute Engine Host for NeoFlow-QA / CARE"
echo "========================================================="

# 1. Update OS and install Node.js 20 & build tools
echo "📦 Installing Node.js 20 & Linux utilities..."
sudo apt-get update
sudo apt-get install -y curl git build-essential

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

node -v
npm -v

# 2. Install Project Dependencies & Native Playwright Browsers with OS libraries
echo "🎭 Installing NPM dependencies and Playwright system dependencies..."
npm ci
npx playwright install --with-deps

# 3. Create sample .env if not present
if [ ! -f .env ]; then
    echo "⚙️ Creating default .env for GCP VM..."
    cat << 'ENVEOF' > .env
AI_PROVIDER=vertex
GCP_REGION=us-central1
ENVIRONMENT=uat
HEADLESS=true
REPORT_TITLE=Autonomous Serenity/JS Living Documentation
ENVEOF
fi

echo "========================================================="
echo "✅ GCP Host VM Setup Complete! You can run CARE directly with:"
echo "   npm run care:explore -- https://your-target-app.com"
echo "========================================================="
