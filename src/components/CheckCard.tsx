import { useState } from 'react'
import type { CodeCheckResult } from '../lib/codeAnalyzer'
import type { Variant } from '../lib/flagsmith'
import { CheckCircle2, XCircle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  check: CodeCheckResult
  variant: Variant
  defaultExpanded?: boolean
  onConversion: () => void
}

export function CheckCard({ check, variant, defaultExpanded = false, onConversion }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copied, setCopied] = useState(false)

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(check.fixSnippet)
    setCopied(true)
    onConversion()
    setTimeout(() => setCopied(false), 2000)
  }

  const severityBadge = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }[check.severity]

  return (
    <div
      data-check-id={check.id}
      data-check-status={check.passed ? 'pass' : 'fail'}
      className={`rounded-xl border transition p-4 ${
        check.passed
          ? 'border-slate-800 bg-slate-900/40'
          : 'border-slate-800 bg-slate-900/90 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {check.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{check.title}</h3>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${severityBadge}`}>
                {check.severity} · {check.points} pts
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{check.explanation}</p>
          </div>
        </div>

        {!check.passed && variant === 'guided_fix' && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 font-medium px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 transition"
          >
            {expanded ? 'Hide Fix' : 'View Fix'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {!check.passed && variant === 'guided_fix' && expanded && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-accent-300">File: {check.fixFilename}</span>
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-accent-600 hover:bg-accent-500 text-white font-medium transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Fix Config'}
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800">
            <code>{check.fixSnippet}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
