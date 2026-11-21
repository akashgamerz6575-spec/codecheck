import type { RepoConfigBundle } from '../lib/codeAnalyzer'

export interface SampleRepo {
  id: string
  label: string
  subtitle: string
  bundle: RepoConfigBundle
}

export const SAMPLE_REPOS: SampleRepo[] = [
  {
    id: 'production-saas',
    label: 'Production SaaS',
    subtitle: 'Strict TypeScript, CI/CD, Biome, Vitest & Dependabot (100/100)',
    bundle: {
      repoName: 'forge-kit/production-saas',
      tree: [
        { path: '.github/workflows/ci.yml', type: 'blob' },
        { path: '.github/dependabot.yml', type: 'blob' },
        { path: 'tsconfig.json', type: 'blob' },
        { path: 'biome.json', type: 'blob' },
        { path: '.gitignore', type: 'blob' },
        { path: 'package.json', type: 'blob' },
        { path: 'package-lock.json', type: 'blob' },
        { path: 'vitest.config.ts', type: 'blob' },
        { path: 'src/main.ts', type: 'blob', size: 1200 },
        { path: 'src/lib/auth.ts', type: 'blob', size: 2400 },
        { path: 'src/lib/auth.test.ts', type: 'blob', size: 1800 },
        { path: 'src/components/ErrorBoundary.tsx', type: 'blob', size: 900 },
      ],
      packageJson: JSON.stringify({
        name: 'production-saas',
        scripts: { build: 'tsc && vite build', test: 'vitest run' },
      }),
      tsconfigJson: JSON.stringify({
        compilerOptions: { strict: true, target: 'ES2022' },
      }),
      gitignore: 'node_modules/\n.env\n.env.local\ndist/\n',
      ciWorkflow: 'name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest',
      biomeJson: '{"linter": {"enabled": true}}',
      dependabotYml: 'version: 2\nupdates:\n  - package-ecosystem: "npm"',
    },
  },
  {
    id: 'mvp-starter',
    label: 'MVP Starter',
    subtitle: 'Healthy code, but missing automated CI/CD and Dependabot (75/100)',
    bundle: {
      repoName: 'solo-founder/mvp-starter',
      tree: [
        { path: 'tsconfig.json', type: 'blob' },
        { path: 'eslint.config.js', type: 'blob' },
        { path: '.gitignore', type: 'blob' },
        { path: 'package.json', type: 'blob' },
        { path: 'package-lock.json', type: 'blob' },
        { path: 'src/index.ts', type: 'blob', size: 1500 },
        { path: 'src/utils.test.ts', type: 'blob', size: 1200 },
        { path: 'src/components/logger.ts', type: 'blob', size: 800 },
      ],
      packageJson: JSON.stringify({
        name: 'mvp-starter',
        scripts: { test: 'vitest' },
      }),
      tsconfigJson: JSON.stringify({
        compilerOptions: { strict: true },
      }),
      gitignore: 'node_modules/\n.env\ndist/\n',
    },
  },
  {
    id: 'quick-script',
    label: 'Quick Prototype',
    subtitle: 'No types, loose gitignore, no tests or automation (0/100)',
    bundle: {
      repoName: 'student-dev/hackathon-scrape',
      tree: [
        { path: 'package.json', type: 'blob' },
        { path: 'index.js', type: 'blob', size: 45000 },
        { path: 'config.json', type: 'blob', size: 800 },
      ],
      packageJson: JSON.stringify({
        name: 'hackathon-scrape',
        scripts: { start: 'node index.js' },
      }),
      gitignore: null,
    },
  },
]
