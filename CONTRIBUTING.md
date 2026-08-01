# Contributing to NeoFlow-QA 🤖✨

Thank you for your interest in contributing to **NeoFlow-QA**! We welcome contributions from the open-source community, whether it's fixing bugs, adding new BDD features, improving documentation, or refining our AI agent workflows.

---

## 🚀 Getting Started

### 1. Fork & Clone
Fork the repository on GitHub and clone it locally:

```sh
git clone https://github.com/<your-username>/NeoFlow-QA.git
cd NeoFlow-QA
```

### 2. Install Dependencies & Browsers
Install Node.js dependencies and download Playwright browser binaries:

```sh
npm ci
npx playwright install
```

### 3. Create a Feature Branch
Create a new branch for your work:

```sh
git checkout -b feature/my-new-feature
```

---

## 🛠️ Development & Testing Workflow

### Running Tests
Before submitting changes, ensure all tests pass:

```sh
# Execute all Cucumber BDD scenarios and compile Serenity report
npm test

# Run specific scenarios using tags
npx cucumber-js --tags "@smoke"
```

### Code Formatting & Linting
Ensure your code adheres to ESLint and TypeScript standards:

```sh
npm run lint
npm run lint:fix
```

### Adding New BDD Features & Step Definitions
1. Write or update Gherkin scenarios under `features/`.
2. Implement step definitions under `step-definitions/` using the **Screenplay Pattern** (`actorCalled('User')`, `BrowseTheWebWithPlaywright`).
3. If using raw Playwright recordings, save them under `codegen/*_raw.spec.ts` and test them with:
   ```sh
   npx playwright test -c playwright.codegen.config.ts codegen/<your_spec>_raw.spec.ts
   ```

---

## 🔀 Submitting a Pull Request (PR)

1. **Commit Changes**: Keep commit messages clear and descriptive.
2. **Push to Fork**:
   ```sh
   git push origin feature/my-new-feature
   ```
3. **Open a PR**: Open a Pull Request against `main` on the official repository [`abhishek4018/NeoFlow-QA`](https://github.com/abhishek4018/NeoFlow-QA).
4. Fill out the PR template completely so maintainers can review your changes efficiently.

Thank you for making **NeoFlow-QA** better for everyone! 🚀
