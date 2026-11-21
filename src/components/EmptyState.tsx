import { CODE_CHECK_DEFINITIONS } from '../lib/codeAnalyzer'

export function EmptyState() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">
          Automated Code Quality Scoring & Instant Drop-in Fixes
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Scan any public repository via GitHub Trees API to audit CI automation, strict type safety, test suites, and secret hygiene.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CODE_CHECK_DEFINITIONS.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-semibold text-white">{c.title}</h3>
              <span className="text-xs font-mono font-bold text-accent-400">{c.points} pts</span>
            </div>
            <p className="text-xs text-slate-400">{c.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
