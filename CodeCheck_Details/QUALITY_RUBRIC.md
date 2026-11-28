# Code Quality Rubric (100 Points Total)

CodeCheck deterministically audits repositories across 8 checks:

### 1. Automated CI/CD Pipeline (15 Points — Critical)
- **What it checks:** Presence of GitHub Actions workflows under `.github/workflows/*.yml` triggered on push or pull_request.
- **Remediation:** Drop-in `.github/workflows/ci.yml` running lint, build, and test steps.

### 2. Type Safety & Strictness (15 Points — Critical)
- **What it checks:** `tsconfig.json` with `"strict": true` and `"noImplicitAny": true`, or implementation in a statically typed language (Go, Rust).
- **Remediation:** Production-grade strict `tsconfig.json`.

### 3. Test Suite Setup (15 Points — Critical)
- **What it checks:** Detection of test files (`*.test.ts`, `*.spec.js`, `tests/`) and configured test runner scripts (Vitest, Jest, Pytest).
- **Remediation:** `vitest.config.ts` configuration.

### 4. Linter & Formatter Automation (10 Points — High)
- **What it checks:** Configuration files for Biome (`biome.json`), ESLint, or Prettier.
- **Remediation:** Drop-in `biome.json` for fast formatting and linting.

### 5. Secret Protection & Gitignore Hygiene (15 Points — High)
- **What it checks:** `.gitignore` actively preventing commits of `.env` files, credentials, and vendor packages (`node_modules/`).
- **Remediation:** Secure `.gitignore` template.

### 6. Automated Security & Dependency Audits (10 Points — Medium)
- **What it checks:** Dependabot configuration (`.github/dependabot.yml`) and presence of package lockfiles (`package-lock.json`, `pnpm-lock.yaml`, etc.).
- **Remediation:** Automated weekly Dependabot configuration.

### 7. Architecture & Modularity (10 Points — Medium)
- **What it checks:** Clean directory modularization (`src/`, `lib/`) and absence of monolithic code files (>800 lines).
- **Remediation:** Modular package architecture guidelines.

### 8. Code Hygiene & Error Resilience (10 Points — Low)
- **What it checks:** Implementation of React Error Boundaries or structured application logging.
- **Remediation:** Drop-in `ErrorBoundary.tsx` component.
