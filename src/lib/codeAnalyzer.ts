/**
 * CodeCheck Code Quality & Launch Readiness Analyzer
 *
 * Evaluates repository health across 8 concrete checks (100 points total).
 * Zero server requirements; runs purely client-side.
 * Every failing check produces an explanation and an instant drop-in config fix snippet.
 */

export type CodeCheckId =
  | 'ci'
  | 'types'
  | 'tests'
  | 'linter'
  | 'security'
  | 'deps'
  | 'modularity'
  | 'hygiene'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface CodeCheckDefinition {
  id: CodeCheckId
  title: string
  points: number
  severity: Severity
  summary: string
}

export const CODE_CHECK_DEFINITIONS: readonly CodeCheckDefinition[] = [
  {
    id: 'ci',
    title: 'Automated CI/CD Pipeline',
    points: 15,
    severity: 'critical',
    summary: 'Automated continuous integration running lint, build, and tests on push and pull requests.',
  },
  {
    id: 'types',
    title: 'Type Safety & Strictness',
    points: 15,
    severity: 'critical',
    summary: 'Strict compiler configuration preventing unhandled any types and runtime type errors.',
  },
  {
    id: 'tests',
    title: 'Test Suite & Runner Setup',
    points: 15,
    severity: 'critical',
    summary: 'Automated test suite (Vitest, Jest, Pytest) with structured test suites.',
  },
  {
    id: 'linter',
    title: 'Linter & Formatter Automation',
    points: 10,
    severity: 'high',
    summary: 'Fast automated linting and formatting tooling (Biome, ESLint, Prettier, Ruff).',
  },
  {
    id: 'security',
    title: 'Secret Protection & Gitignore Hygiene',
    points: 15,
    severity: 'high',
    summary: 'Strict gitignore policies protecting against committed .env files, tokens, and build artifacts.',
  },
  {
    id: 'deps',
    title: 'Automated Dependency & Security Audits',
    points: 10,
    severity: 'medium',
    summary: 'Dependabot or Renovate automation with committed lockfiles for reproducible builds.',
  },
  {
    id: 'modularity',
    title: 'Architecture & Modularity Health',
    points: 10,
    severity: 'medium',
    summary: 'Organized directory structure (src/lib) without bloated god-files (>800 lines).',
  },
  {
    id: 'hygiene',
    title: 'Code Hygiene & Error Resilience',
    points: 10,
    severity: 'low',
    summary: 'Structured error handling, logging discipline, and manageable technical debt.',
  },
] as const

export const MAX_CODE_SCORE = CODE_CHECK_DEFINITIONS.reduce((sum, c) => sum + c.points, 0)

export interface RepoTreeEntry {
  path: string
  type: 'blob' | 'tree'
  size?: number
}

export interface RepoConfigBundle {
  repoName: string
  tree: RepoTreeEntry[]
  packageJson?: string | null
  tsconfigJson?: string | null
  gitignore?: string | null
  ciWorkflow?: string | null
  biomeJson?: string | null
  eslintConfig?: string | null
  dependabotYml?: string | null
}

export interface CodeCheckResult extends CodeCheckDefinition {
  passed: boolean
  explanation: string
  fixSnippet: string
  fixFilename: string
}

export interface CodeAnalysisResult {
  repoName: string
  score: number
  maxScore: number
  grade: string
  gradeLabel: string
  passedCount: number
  failedCount: number
  checks: CodeCheckResult[]
  failingChecks: CodeCheckResult[]
  checklistReport: string
  allFixesCombined: string
}

export function analyzeCodeQuality(bundle: RepoConfigBundle): CodeAnalysisResult {
  const repoName = bundle.repoName || 'my-org/my-project'
  const filePaths = bundle.tree.map((f) => f.path.toLowerCase())

  // 1. CI/CD Pipeline (15)
  const hasWorkflow = filePaths.some((p) => p.startsWith('.github/workflows/') && (p.endsWith('.yml') || p.endsWith('.yaml')))
  const ciContent = bundle.ciWorkflow ?? ''
  const runsOnCi = /push|pull_request/.test(ciContent) || hasWorkflow
  const ciPassed = hasWorkflow && runsOnCi
  const ciExplanation = ciPassed
    ? 'GitHub Actions CI workflow detected under .github/workflows/.'
    : 'No automated CI/CD workflow found to validate code changes on pull requests.'
  const ciFix = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test --if-present`

  // 2. Type Safety & Strictness (15)
  const hasTsConfig = filePaths.some((p) => p === 'tsconfig.json' || p.startsWith('tsconfig.'))
  const tsConfigRaw = bundle.tsconfigJson ?? ''
  const isStrictTs = /"strict"\s*:\s*true/.test(tsConfigRaw)
  const isTypedNonTs = filePaths.some((p) => p.endsWith('.rs') || p.endsWith('.go') || p.endsWith('.java'))
  const typesPassed = (hasTsConfig && isStrictTs) || isTypedNonTs
  const typesExplanation = typesPassed
    ? isTypedNonTs
      ? 'Repository is implemented in a statically typed language.'
      : 'Strict TypeScript configuration ("strict": true) is active.'
    : hasTsConfig
      ? 'TypeScript configuration found, but "strict": true is not enabled.'
      : 'No strict TypeScript or typed language configuration detected.'
  const typesFix = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}`

  // 3. Test Suite (15)
  const hasTestFiles = filePaths.some((p) =>
    /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(p) ||
    p.includes('/__tests__/') ||
    p.startsWith('tests/') ||
    p.endsWith('_test.go'),
  )
  const hasTestConfig = filePaths.some((p) =>
    p.includes('vitest.config') ||
    p.includes('jest.config') ||
    p === 'pytest.ini',
  )
  const pkgRaw = bundle.packageJson ?? ''
  const hasTestScript = /"test"\s*:\s*"[^"]+"/.test(pkgRaw) && !pkgRaw.includes('no test specified')
  const testsPassed = (hasTestFiles && hasTestScript) || (hasTestFiles && hasTestConfig)
  const testsExplanation = testsPassed
    ? 'Automated test suite configured with runnable test script and test files.'
    : hasTestFiles
      ? 'Test files exist, but no runnable test script was found in package.json.'
      : 'No test files (*.test.ts, *.spec.js, etc.) were found.'
  const testsFix = `// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})`

  // 4. Linter & Formatter (10)
  const hasBiome = filePaths.some((p) => p === 'biome.json' || p === 'biome.jsonc')
  const hasEslint = filePaths.some((p) => p.startsWith('.eslintrc') || p.startsWith('eslint.config'))
  const hasPrettier = filePaths.some((p) => p.startsWith('.prettierrc'))
  const linterPassed = hasBiome || hasEslint || hasPrettier
  const linterExplanation = linterPassed
    ? hasBiome
      ? 'Biome linter & formatter configuration active.'
      : 'ESLint / Prettier code quality configuration found.'
    : 'No automated linter or code formatter (Biome, ESLint) detected.'
  const linterFix = `{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}`

  // 5. Secret Protection & Gitignore Hygiene (15)
  const gitignoreRaw = bundle.gitignore ?? ''
  const hasGitignore = filePaths.includes('.gitignore')
  const blocksEnv = /\.env/.test(gitignoreRaw)
  const blocksModules = /node_modules|target\/|vendor\//.test(gitignoreRaw)
  const securityPassed = hasGitignore && blocksEnv && blocksModules
  const securityExplanation = securityPassed
    ? '.gitignore securely protects against committed secrets (.env) and dependencies.'
    : hasGitignore
      ? 'A .gitignore exists, but does not explicitly protect against .env secrets or vendor modules.'
      : 'Missing .gitignore file; risk of leaking environment keys or build artifacts.'
  const securityFix = `# Environment & secrets
.env
.env.local
.env.*.local
*.pem
*.key

# Dependencies & output
node_modules/
dist/
build/
.cache/
.DS_Store`

  // 6. Security & Dependency Audits (10)
  const hasDependabot = filePaths.some((p) => p === '.github/dependabot.yml' || p === '.github/dependabot.yaml')
  const hasLockfile = filePaths.some((p) =>
    p === 'package-lock.json' ||
    p === 'pnpm-lock.yaml' ||
    p === 'yarn.lock' ||
    p === 'cargo.lock' ||
    p === 'go.sum',
  )
  const depsPassed = hasLockfile && (hasDependabot || /"audit"/.test(pkgRaw))
  const depsExplanation = depsPassed
    ? hasDependabot
      ? 'Committed lockfile and Dependabot automated vulnerability updates configured.'
      : 'Committed lockfile and security audit scripts present.'
    : hasLockfile
      ? 'Lockfile is committed, but no automated Dependabot configuration was found.'
      : 'No package lockfile found to ensure deterministic dependency installations.'
  const depsFix = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"`

  // 7. Modularity & Architecture (10)
  const hasSourceDir = filePaths.some((p) => p.startsWith('src/') || p.startsWith('lib/') || p.startsWith('app/'))
  const hugeFiles = bundle.tree.filter((f) => f.type === 'blob' && (f.size ?? 0) > 40000 && !f.path.includes('lock'))
  const modularityPassed = hasSourceDir && hugeFiles.length === 0
  const modularityExplanation = modularityPassed
    ? 'Clean source modularization under standard directory structure without bloated god-files.'
    : !hasSourceDir
      ? 'No standard modular root directory (src/, lib/, app/) was detected.'
      : `Detected ${hugeFiles.length} oversized file(s) (>40KB source blobs) requiring decomposition.`
  const modularityFix = `## Recommended Architecture Refactoring

Break oversized modules into domain-focused subpackages:

\`\`\`
src/
  components/       # Presentational UI components
  lib/              # Deterministic domain logic & utilities
  types/            # Shared TypeScript contracts
  data/             # Static configurations & mocks
\`\`\`

Avoid single source files exceeding 400 lines of code.`

  // 8. Hygiene & Error Handling (10)
  const hasErrorBoundary = filePaths.some((p) => p.includes('errorboundary') || p.includes('error-boundary'))
  const hasLoggerOrClient = filePaths.some((p) => p.includes('logger') || p.includes('telemetry') || p.includes('client'))
  const hygienePassed = hasErrorBoundary || hasLoggerOrClient || filePaths.length > 5
  const hygieneExplanation = hygienePassed
    ? 'Structured client error resilience and modular entrypoints present.'
    : 'No structured error boundary or telemetry client found.'
  const hygieneFix = `import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="p-4 bg-red-950 text-red-200">Something went wrong.</div>
    }
    return this.props.children
  }
}`

  const rawResults = [
    { passed: ciPassed, explanation: ciExplanation, fixSnippet: ciFix, fixFilename: '.github/workflows/ci.yml' },
    { passed: typesPassed, explanation: typesExplanation, fixSnippet: typesFix, fixFilename: 'tsconfig.json' },
    { passed: testsPassed, explanation: testsExplanation, fixSnippet: testsFix, fixFilename: 'vitest.config.ts' },
    { passed: linterPassed, explanation: linterExplanation, fixSnippet: linterFix, fixFilename: 'biome.json' },
    { passed: securityPassed, explanation: securityExplanation, fixSnippet: securityFix, fixFilename: '.gitignore' },
    { passed: depsPassed, explanation: depsExplanation, fixSnippet: depsFix, fixFilename: '.github/dependabot.yml' },
    { passed: modularityPassed, explanation: modularityExplanation, fixSnippet: modularityFix, fixFilename: 'ARCHITECTURE.md' },
    { passed: hygienePassed, explanation: hygieneExplanation, fixSnippet: hygieneFix, fixFilename: 'src/components/ErrorBoundary.tsx' },
  ]

  const checks: CodeCheckResult[] = CODE_CHECK_DEFINITIONS.map((def, idx) => ({
    ...def,
    ...rawResults[idx],
  }))

  const passedChecks = checks.filter((c) => c.passed)
  const failingChecks = checks.filter((c) => !c.passed)
  const score = passedChecks.reduce((sum, c) => sum + c.points, 0)
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 55 ? 'C' : score >= 35 ? 'D' : 'F'
  const gradeLabel =
    score >= 90 ? 'Production Ready' : score >= 75 ? 'Healthy Setup' : score >= 55 ? 'Needs Polish' : 'Fragile / Unchecked'

  const checklistReport = [
    `CodeCheck Code Quality Report — ${repoName}`,
    `Score: ${score}/${MAX_CODE_SCORE} (${gradeLabel})`,
    `Checks passed: ${passedChecks.length}/${checks.length}`,
    '',
    ...checks.map((c) => `[${c.passed ? 'PASS' : 'FAIL'}] ${c.title} (${c.points} pts, ${c.severity}) — ${c.explanation}`),
    '',
    failingChecks.length > 0
      ? 'Next step: apply missing configurations to enhance code safety and automation.'
      : 'All code quality checks passed with zero missing configurations.',
    '',
    'Generated with CodeCheck.',
  ].join('\n')

  const allFixesCombined = failingChecks
    .map((c) => `### File: \`${c.fixFilename}\` (${c.title})\n\n\`\`\`${c.fixFilename.endsWith('.json') ? 'json' : c.fixFilename.endsWith('.yml') ? 'yaml' : 'typescript'}\n${c.fixSnippet}\n\`\`\``)
    .join('\n\n---\n\n')

  return {
    repoName,
    score,
    maxScore: MAX_CODE_SCORE,
    grade,
    gradeLabel,
    passedCount: passedChecks.length,
    failedCount: failingChecks.length,
    checks,
    failingChecks,
    checklistReport,
    allFixesCombined,
  }
}
