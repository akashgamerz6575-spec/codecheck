import { useState } from 'react'
import type { CodeAnalysisResult } from '../lib/codeAnalyzer'
import type { Variant } from '../lib/flagsmith'
import { CheckCircle2, Copy, Share2, Sparkles, Terminal } from 'lucide-react'

interface Props {
  result: CodeAnalysisResult
  variant: Variant
  onConversion: () => void
}

export function ScoreHeader({ result, variant, onConversion }: Props) {
  const [copiedCTA, setCopiedCTA] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  const handlePrimaryCTA = () => {
    const textToCopy =
      variant === 'guided_fix' ? result.allFixesCombined : result.checklistReport
    navigator.clipboard.writeText(textToCopy)
    setCopiedCTA(true)
    onConversion()
    setTimeout(() => setCopiedCTA(false), 2000)
  }

  const handleShareLink = () => {
    const url = `${window.location.origin}/?repo=${encodeURIComponent(result.repoName)}`
    navigator.clipboard.writeText(url)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  const scoreColor =
    result.score >= 90
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : result.score >= 75
        ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
        : result.score >= 55
          ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
          : 'text-rose-400 border-rose-500/40 bg-rose-500/10'

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            aria-label="Code quality score"
            className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 font-mono font-bold ${scoreColor}`}
          >
            <span className="text-3xl leading-none">{result.score}</span>
            <span className="text-xs opacity-70 mt-1">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Grade {result.grade} · {result.gradeLabel}
              </span>
              <span className="text-xs text-slate-400">
                {result.passedCount} passed · {result.failedCount} failed
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-accent-400" />
              {result.repoName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Scanned via GitHub Trees & Config Inspection Engine
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedShare ? 'Copied Link!' : 'Copy share link'}
          </button>

          <button
            onClick={handlePrimaryCTA}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-accent-500 hover:bg-accent-600 text-white shadow-lg shadow-sky-500/20 transition cursor-pointer"
          >
            {copiedCTA ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Copied to Clipboard!
              </>
            ) : variant === 'guided_fix' ? (
              <>
                <Sparkles className="w-4 h-4" />
                Copy All Missing Configs
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Checklist Summary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
