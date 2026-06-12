export default function HintPanel({ hint }) {
  if (!hint) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 gap-2">
      <span className="material-symbols-outlined text-outline text-[40px]">lightbulb</span>
      <p className="text-sm text-on-surface-variant font-medium">No hint yet</p>
      <p className="text-xs text-outline leading-relaxed">Click "Hint" in the toolbar to get a directional nudge without spoiling the solution.</p>
    </div>
  )

  const lines = hint.split('\n').filter(l => l.trim())
  const get = (label) => {
    const line = lines.find(l => l.startsWith(label))
    return line ? line.replace(label, '').trim() : null
  }

  const current = get('Current:')
  const suggested = get('Suggested:')
  const keyIdea = get('Key Idea:')
  const consider = get('Consider:')

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3">
      <div className="flex items-center gap-2 pb-1">
        <span className="material-symbols-outlined text-tertiary text-[18px]">lightbulb</span>
        <p className="text-xs font-semibold text-tertiary uppercase tracking-widest">AI Hint</p>
      </div>

      {(current || suggested) && (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-3 space-y-3">
          <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Approach</p>
          {current && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-outline uppercase tracking-wide">Current</p>
              <div className="flex flex-wrap gap-1.5">
                {current.split('/').map((t, i) => (
                  <span key={i} className="text-xs bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant">{t.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {suggested && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-outline uppercase tracking-wide">Suggested</p>
              <div className="flex flex-wrap gap-1.5">
                {suggested.split('/').map((t, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full">{t.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {keyIdea && (
        <div className="bg-tertiary/10 border border-tertiary/30 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-tertiary text-[14px]">key</span>
            <p className="text-[10px] font-semibold text-tertiary uppercase tracking-wider">Key Idea</p>
          </div>
          <p className="text-sm text-on-surface leading-relaxed">{keyIdea}</p>
        </div>
      )}

      {consider && (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-3">
          <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Consider</p>
          <p className="text-sm text-on-surface leading-relaxed">{consider}</p>
        </div>
      )}

      {!current && !keyIdea && !consider && (
        <div className="bg-tertiary/10 border border-tertiary/30 rounded-xl p-3">
          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{hint}</p>
        </div>
      )}
    </div>
  )
}
