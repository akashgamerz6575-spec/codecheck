import { useState } from 'react'
import type { ExperimentTelemetry } from '../lib/flagsmith'
import { Activity, ChevronDown, ChevronUp, RefreshCw, ExternalLink } from 'lucide-react'

interface Props {
  telemetry: ExperimentTelemetry
  onResetSession: () => void
}

export function ExperimentInspector({ telemetry, onResetSession }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div
      aria-label="Flagsmith experiment inspector"
      data-variant={telemetry.variant}
      data-exposure={telemetry.exposureRecorded ? 'recorded' : 'none'}
      data-conversion={telemetry.conversionRecorded ? 'recorded' : 'none'}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur shadow-2xl"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between py-2.5 cursor-pointer text-xs font-mono text-slate-300 select-none"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-accent-400 animate-pulse" />
            <span className="font-semibold text-white">Flagsmith Experiment Telemetry</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Variant: <strong className="text-accent-400">{telemetry.variant}</strong>
            </span>
            <span className="hidden sm:inline text-slate-400">
              Visitor: <span className="text-slate-200">{telemetry.visitorId}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${telemetry.exposureRecorded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              Exposure: {telemetry.exposureRecorded ? 'Recorded' : 'Pending'}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${telemetry.conversionRecorded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              Conversion: {telemetry.conversionRecorded ? 'Sent' : 'None'}
            </span>
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {open && (
          <div className="py-4 border-t border-slate-800/80 text-xs font-mono grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="text-slate-400 font-semibold mb-2">EXPERIMENT SPECS</h4>
              <p className="text-slate-300">Flag: <code className="text-accent-300">code_fix_workflow_mode</code></p>
              <p className="text-slate-300 mt-1">Metric: <code className="text-emerald-300">code_fix_applied</code></p>
              <p className="text-slate-400 mt-1">Rollout: 100% traffic (50/50 split)</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h4 className="text-slate-400 font-semibold mb-2">LIVE TIMESTAMPS</h4>
              <p className="text-slate-300">
                Exposure: {telemetry.exposureTimestamp ? `Recorded at ${telemetry.exposureTimestamp}` : 'Awaiting result view'}
              </p>
              <p className="text-slate-300 mt-1">
                Conversion: {telemetry.conversionTimestamp ? `Sent at ${telemetry.conversionTimestamp}` : 'Click copy button to fire'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-slate-400 font-semibold mb-2">ACTIONS & DASHBOARD</h4>
                <a
                  href="https://app.flagsmith.com/project/55323"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-accent-400 hover:text-accent-300 mb-2"
                >
                  Open Flagsmith Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                onClick={onResetSession}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Visitor Session (Re-bucket)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
