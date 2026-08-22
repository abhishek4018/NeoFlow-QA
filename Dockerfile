FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig*.json cucumber.js playwright*.ts ./

# Install build tools for native addons (better-sqlite3) and Java for Serenity BDD reporter
RUN apt-get update && apt-get install -y build-essential python3 make default-jre && rm -rf /var/lib/apt/lists/*

# Install project dependencies
RUN npm ci

# Copy full application source and tests
COPY . .

# Environment Defaults
ENV TARGET_URL="https://quickexamcreator.com"
ENV DAEMON_INTERVAL_SECONDS=3600

# Expose Serenity HTML Report Port
EXPOSE 8080

CMD ["npx", "ts-node", "--transpile-only", "src/care/daemon.ts"]
