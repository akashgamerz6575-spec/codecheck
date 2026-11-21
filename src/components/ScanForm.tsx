import { useState } from 'react'
import { FormEvent } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { SAMPLE_REPOS } from '../data/samples'

interface Props {
  onScan: (repoInput: string) => void
  loading: boolean
}

export function ScanForm({ onScan, loading }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onScan(input.trim())
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter public GitHub repo (e.g. facebook/react or full URL)..."
          className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent-400 shadow-inner transition"
          disabled={loading}
        />
        <Search className="absolute left-3.5 top-4 w-4 h-4 text-slate-400" />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-xs font-semibold shadow transition cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning...
            </span>
          ) : (
            'Scan Code'
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">Try 1-click samples:</span>
        {SAMPLE_REPOS.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onScan(sample.bundle.repoName)}
            disabled={loading}
            className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  )
}
