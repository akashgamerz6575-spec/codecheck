import type { RepoConfigBundle } from './codeAnalyzer'
import { SAMPLE_REPOS } from '../data/samples'

export interface ParsedRepoRef {
  owner: string
  repo: string
}

export function parseRepoRef(input: string): { ok: true; ref: ParsedRepoRef } | { ok: false; error: string } {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: 'Please enter a repository URL or owner/repo' }

  // Clean GitHub URLs: https://github.com/owner/repo/tree/main -> owner/repo
  const clean = trimmed
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/tree\/.*$/i, '')
    .replace(/\/+$/, '')

  const parts = clean.split('/')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return {
      ok: true,
      ref: { owner: parts[0], repo: parts[1] },
    }
  }

  return { ok: false, error: 'Expected format: owner/repo or https://github.com/owner/repo' }
}

export async function fetchRepoBundle(ref: ParsedRepoRef): Promise<RepoConfigBundle> {
  // Check if it's one of our built-in sample mocks first
  const matchSample = SAMPLE_REPOS.find(
    (s) => s.bundle.repoName.toLowerCase() === `${ref.owner}/${ref.repo}`.toLowerCase() || s.id === ref.repo,
  )
  if (matchSample) {
    return matchSample.bundle
  }

  const baseApi = `https://api.github.com/repos/${ref.owner}/${ref.repo}`
  
  // 1. Fetch default branch info
  const repoRes = await fetch(baseApi)
  if (!repoRes.ok) {
    if (repoRes.status === 404) throw new Error(`Repository ${ref.owner}/${ref.repo} not found or is private.`)
    if (repoRes.status === 403) throw new Error('GitHub API rate limit reached. Please try one of the built-in samples.')
    throw new Error(`GitHub API error (${repoRes.status})`)
  }
  const repoData = await repoRes.json()
  const defaultBranch = repoData.default_branch || 'main'

  // 2. Fetch Git Tree recursively
  const treeRes = await fetch(`${baseApi}/git/trees/${defaultBranch}?recursive=1`)
  let tree = []
  if (treeRes.ok) {
    const treeData = await treeRes.json()
    tree = (treeData.tree || []).map((t: any) => ({
      path: t.path,
      type: t.type === 'blob' ? 'blob' : 'tree',
      size: t.size,
    }))
  }

  // 3. Helper to fetch raw file contents
  async function fetchRaw(path: string): Promise<string | null> {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${defaultBranch}/${path}`)
      if (res.ok) return await res.text()
    } catch {}
    return null
  }

  const [packageJson, tsconfigJson, gitignore, ciWorkflow, biomeJson] = await Promise.all([
    fetchRaw('package.json'),
    fetchRaw('tsconfig.json'),
    fetchRaw('.gitignore'),
    fetchRaw('.github/workflows/ci.yml'),
    fetchRaw('biome.json'),
  ])

  return {
    repoName: `${ref.owner}/${ref.repo}`,
    tree,
    packageJson,
    tsconfigJson,
    gitignore,
    ciWorkflow,
    biomeJson,
  }
}
