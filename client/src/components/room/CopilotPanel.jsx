export default function CopilotPanel({ followup }) {
  if (!followup) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 gap-2">
      <span className="material-symbols-outlined text-outline text-[40px]">smart_toy</span>
      <p className="text-sm text-on-surface-variant font-medium">Interviewer Copilot</p>
      <p className="text-xs text-outline leading-relaxed">Click "Copilot" to get AI-suggested follow-up questions based on the candidate's current code.</p>
    </div>
  )

  const questions = followup
    .split('\n')
    .filter(l => l.trim() && /^\d+\./.test(l.trim()))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3">
      <div className="flex items-center gap-2 pb-1">
        <span className="material-symbols-outlined text-secondary text-[18px]">smart_toy</span>
        <p className="text-xs font-semibold text-secondary uppercase tracking-widest">Copilot</p>
      </div>
      <p className="text-xs text-on-surface-variant">Suggested follow-ups based on candidate's code</p>

      {questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="bg-surface-container-high border border-outline-variant rounded-xl p-3 group hover:border-secondary/50 transition-colors">
              <div className="flex gap-2.5">
                <span className="text-secondary font-bold text-sm shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-sm text-on-surface leading-relaxed">{q}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-3">
          <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{followup}</p>
        </div>
      )}
    </div>
  )
}
