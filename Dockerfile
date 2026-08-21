FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig*.json cucumber.js playwright*.ts ./

# Install project dependencies
RUN npm ci

# Copy full application source and tests
COPY . .

# Environment Defaults
ENV TARGET_URL="https://quickexamcreator.com"
ENV DAEMON_INTERVAL_SECONDS=3600

# Expose Serenity HTML Report Port
EXPOSE 8080

ENTRYPOINT ["./scripts/daemon-runner.sh"]
