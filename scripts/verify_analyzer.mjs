import assert from 'node:assert/strict'
import { analyzeCodeQuality, CODE_CHECK_DEFINITIONS, MAX_CODE_SCORE } from '../src/lib/codeAnalyzer.ts'
import { SAMPLE_REPOS } from '../src/data/samples.ts'

console.log('--- RUNNING CODECHECK ANALYZER VERIFICATION ---')

assert.equal(CODE_CHECK_DEFINITIONS.length, 8, 'Expected 8 checks')
assert.equal(MAX_CODE_SCORE, 100, 'Expected total 100 points')

const EXPECTED = {
  'production-saas': { score: 100, passed: 8, failed: 0 },
  'mvp-starter': { score: 75, passed: 6, failed: 2 },
  'quick-script': { score: 0, passed: 0, failed: 8 },
}

for (const sample of SAMPLE_REPOS) {
  const result = analyzeCodeQuality(sample.bundle)
  const exp = EXPECTED[sample.id]
  assert.ok(exp, `Missing expectation for sample: ${sample.id}`)
  assert.equal(result.score, exp.score, `${sample.id}: score mismatch`)
  assert.equal(result.passedCount, exp.passed, `${sample.id}: passed count mismatch`)
  assert.equal(result.failedCount, exp.failed, `${sample.id}: failed count mismatch`)

  // Determinism check
  const re = analyzeCodeQuality(sample.bundle)
  assert.equal(re.score, result.score, 'Analyzer is not deterministic')
  assert.equal(re.checklistReport, result.checklistReport, 'Checklist report is not deterministic')

  console.log(`✓ Sample ${sample.bundle.repoName.padEnd(30)} Score: ${result.score}/100 (${result.passedCount} passed, ${result.failedCount} failed)`)
}

console.log('\nAll CodeCheck analyzer assertions passed successfully!')
