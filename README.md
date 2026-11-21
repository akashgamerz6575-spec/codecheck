# CodeCheck

Automated GitHub repository code quality scanner with live Flagsmith experimentation.

## Overview

CodeCheck evaluates public GitHub repositories across 8 checks:
- Automated CI/CD Pipeline
- Strict Type Safety
- Automated Test Suite Setup
- Linter & Code Formatter
- Secret Protection & .gitignore
- Dependency Audits & Lockfiles
- Source Modularity & Architecture
- Code Hygiene & Error Boundaries

## Live Flagsmith Experiment

- **Feature Flag:** `code_fix_workflow_mode`
- **Control Arm:** Static diagnostic code quality checklist
- **Treatment Arm:** Inline ready-to-copy configuration files (.github/workflows/ci.yml, tsconfig.json, biome.json, dependabot.yml)
- **Primary Metric:** `code_fix_applied`

## Quickstart

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT
