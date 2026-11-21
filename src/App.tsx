import { useState, useEffect } from 'react'
import { parseRepoRef, fetchRepoBundle } from './lib/github'
import { analyzeCodeQuality, type CodeAnalysisResult } from './lib/codeAnalyzer'
import { useExperiment } from './lib/useExperiment'
import { ScanForm } from './components/ScanForm'
import { ScoreHeader } from './components/ScoreHeader'
import { CheckCard } from './components/CheckCard'
import { EmptyState } from './components/EmptyState'
import { ExperimentInspector } from './components/ExperimentInspector'
import { ChevronDown, ChevronUp, Code2, AlertTriangle } from 'lucide-react'

export default function App() {
  const [result, setResult] = useState<CodeAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passedExpanded, setPassedExpanded] = useState(false)

  const { variant, telemetry, recordExposure, recordConversion, resetSession } = useExperiment()

  const runScan = async (repoInput: string) => {
    setError(null)
    setLoading(true)

    const parsed = parseRepoRef(repoInput)
    if (!parsed.ok) {
      setError(parsed.error)
      setLoading(false)
      return
    }

    try {
      const bundle = await fetchRepoBundle(parsed.ref)
      const analysis = analyzeCodeQuality(bundle)
      setResult(analysis)

      // Update URL query param ?repo=
      const url = new URL(window.location.href)
      url.searchParams.set('repo', `${parsed.ref.owner}/${parsed.ref.repo}`)
      window.history.replaceState({}, '', url.toString())

      // Record Flagsmith exposure
      recordExposure()
    } catch (err: any) {
      setError(err.message || 'Failed to scan repository.')
    } finally {
      setLoading(false)
    }
  }

  // Handle URL ?repo= on initial page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialRepo = params.get('repo')
    if (initialRepo) {
      runScan(initialRepo)
    }
  }, [])

  const failingChecks = result ? result.checks.filter((c) => !c.passed) : []
  const passedChecks = result ? result.checks.filter((c) => c.passed) : []

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col pb-24">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent-500/10 text-accent-400 border border-accent-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">CodeCheck</h1>
              <p className="text-[11px] text-slate-400">Launch Readiness & Code Quality Audit</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Toggle Wars: Track 01
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <ScanForm onScan={runScan} loading={loading} />

        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-6">
            <ScoreHeader result={result} variant={variant} onConversion={recordConversion} />

            {/* Failing checks first above the fold */}
            {failingChecks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                  Attention Required ({failingChecks.length})
                </h3>
                {failingChecks.map((check, idx) => (
                  <CheckCard
                    key={check.id}
                    check={check}
                    variant={variant}
                    defaultExpanded={idx === 0}
                    onConversion={recordConversion}
                  />
                ))}
              </div>
            )}

            {/* Collapsible Passed Checks Section */}
            {passedChecks.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setPassedExpanded(!passedExpanded)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold hover:text-emerald-300 cursor-pointer"
                >
                  Passed Checks ({passedChecks.length})
                  {passedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {passedExpanded && (
                  <div className="space-y-3 mt-3">
                    {passedChecks.map((check) => (
                      <CheckCard
                        key={check.id}
                        check={check}
                        variant={variant}
                        onConversion={recordConversion}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          !loading && <EmptyState />
        )}
      </main>

      <ExperimentInspector telemetry={telemetry} onResetSession={resetSession} />
    </div>
  )
}
