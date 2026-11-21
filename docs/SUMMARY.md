# CodeCheck: Project Overview

CodeCheck is an autonomous, client-side GitHub repository code quality scanner built with React 19, TypeScript, Vite, Tailwind CSS v4, and the Flagsmith JavaScript SDK.

## Key Links

- **Live Production Application:** [https://codecheck-opal.vercel.app](https://codecheck-opal.vercel.app)
- **GitHub Repository:** [https://github.com/akashgamerz6575-spec/codecheck](https://github.com/akashgamerz6575-spec/codecheck)
- **ShipCheck Verification:** [100/100 on ShipCheck](https://shipcheck-lime.vercel.app/?repo=akashgamerz6575-spec/codecheck)
- **Flagsmith Experiment Dashboard:** [Flagsmith Project 55323](https://app.flagsmith.com/project/55323)

## Technical Architecture

- **Runtime:** Single Page Application (100% browser-based, zero backend server or database).
- **GitHub Integration:** Fetches repository file hierarchies via the GitHub Git Trees API (`/git/trees/{branch}?recursive=1`) and retrieves key configuration files (`tsconfig.json`, `package.json`, `.gitignore`, `.github/workflows/ci.yml`, `biome.json`).
- **Telemetry & Bucketing:** Anonymous visitor identity (`cc_<uuid>`) stored in `localStorage`, identified in Flagsmith prior to evaluating multivariate feature flags.
