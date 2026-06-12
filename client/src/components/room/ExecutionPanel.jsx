export default function ExecutionPanel({ result, stdin, onStdinChange, executing }) {
  const isAccepted = result?.status === 'Accepted'

  return (
    <div className="flex flex-col h-full p-3 space-y-3 overflow-y-auto">
      {/* Stdin */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
          <span className="material-symbols-outlined text-[14px]">input</span>
          Stdin
        </label>
        <textarea
          value={stdin}
          onChange={(e) => onStdinChange(e.target.value)}
          placeholder="Paste test input here…"
          rows={3}
          className="w-full bg-surface-container-high text-on-surface text-xs px-3 py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary transition-colors resize-none font-mono"
        />
      </div>

      {/* Executing */}
      {executing && (
        <div className="flex items-center gap-3 bg-tertiary/10 border border-tertiary/30 rounded-xl px-4 py-3">
          <span className="w-4 h-4 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin shrink-0" />
          <p className="text-xs text-tertiary font-medium">Executing your code…</p>
        </div>
      )}

      {/* Result */}
      {result && !executing && (
        <div className="space-y-3">
          {/* Status badge */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
            isAccepted
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
              : 'bg-error/10 border-error/30 text-error'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {isAccepted ? 'check_circle' : 'cancel'}
            </span>
            <span className="text-xs font-semibold">{result.error || result.status}</span>
          </div>

          {/* Stats */}
          {(result.time || result.memory) && (
            <div className="flex gap-3">
              {result.time && (
                <div className="flex-1 bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Time</p>
                  <p className="text-sm font-mono font-bold text-on-surface">{result.time}s</p>
                </div>
              )}
              {result.memory && (
                <div className="flex-1 bg-surface-container-high border border-outline-variant rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wide mb-0.5">Memory</p>
                  <p className="text-sm font-mono font-bold text-on-surface">{result.memory} KB</p>
                </div>
              )}
            </div>
          )}

          {/* Stdout */}
          {result.stdout && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px] text-[#10B981]">output</span>
                stdout
              </p>
              <pre className="bg-surface-container-high border border-outline-variant p-3 rounded-xl text-xs text-[#10B981] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {result.stdout}
              </pre>
            </div>
          )}

          {/* Stderr */}
          {result.stderr && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px] text-error">error_outline</span>
                stderr
              </p>
              <pre className="bg-surface-container-high border border-error/20 p-3 rounded-xl text-xs text-error/80 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {result.stderr}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !executing && (
        <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
          <span className="material-symbols-outlined text-outline text-[36px]">terminal</span>
          <p className="text-xs text-on-surface-variant">Run your code to see output here</p>
        </div>
      )}
    </div>
  )
}
