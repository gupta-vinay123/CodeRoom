import { useState, useRef, useEffect } from 'react'

const LANGUAGES = ['javascript', 'python', 'cpp', 'java', 'go']
const langIcons = { javascript: 'JS', python: 'PY', cpp: 'C++', java: 'JV', go: 'GO' }

export default function RoomHeader({
  roomId, language, onLanguageChange, activeUsers,
  connected, onRunCode, onGetHint, onEndRoom, executing, userRole,
  onGetFollowup
}) {
  const [showLangMenu, setShowLangMenu] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!showLangMenu) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowLangMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showLangMenu])

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b border-outline-variant bg-surface-container gap-2"
      style={{ position: 'relative', zIndex: 100, flexShrink: 0 }}
    >
      {/* Left: Branding + status */}
      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-bold text-primary text-sm tracking-tight">CodeRoom</span>
        <span className="font-mono text-xs text-on-surface-variant hidden sm:block opacity-60">
          {roomId.slice(0, 8)}…
        </span>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${
          connected
            ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
            : 'bg-error/10 border-error/30 text-error'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#10B981] animate-pulse' : 'bg-error'}`} />
          {connected ? 'Live' : 'Reconnecting'}
        </div>
        {activeUsers.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {activeUsers.length}
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>

        {/* Language picker */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowLangMenu(p => !p)}
            className="flex items-center gap-1.5 bg-surface-container-high border border-outline-variant text-on-surface text-xs px-3 py-1.5 rounded-lg hover:border-outline transition-colors font-mono font-semibold"
          >
            {langIcons[language] || language}
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
          </button>
          {showLangMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-surface-container-high border border-outline-variant rounded-xl shadow-2xl overflow-hidden"
              style={{ minWidth: 120, zIndex: 200 }}
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { onLanguageChange(lang); setShowLangMenu(false) }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-mono font-semibold transition-colors flex items-center gap-2
                    ${lang === language
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface hover:bg-surface-variant'
                    }`}
                >
                  {lang === language
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : <span className="w-3.5 inline-block" />
                  }
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hint */}
        <button
          type="button"
          onClick={onGetHint}
          className="flex items-center gap-1.5 text-xs bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/30 text-tertiary px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-[15px]">lightbulb</span>
          <span className="hidden sm:block">Hint</span>
        </button>

        {/* Copilot — interviewer only */}
        {userRole === 'interviewer' && (
          <button
            type="button"
            onClick={onGetFollowup}
            className="flex items-center gap-1.5 text-xs bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">smart_toy</span>
            <span className="hidden sm:block">Copilot</span>
          </button>
        )}

        {/* Run */}
        <button
          type="button"
          onClick={onRunCode}
          disabled={executing}
          className="flex items-center gap-1.5 text-xs bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {executing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:block">Running…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[15px]">play_arrow</span>
              <span className="hidden sm:block">Run</span>
            </>
          )}
        </button>

        {/* End — interviewer only */}
        {userRole === 'interviewer' && (
          <button
            type="button"
            onClick={onEndRoom}
            className="flex items-center gap-1.5 text-xs bg-error/10 hover:bg-error/20 border border-error/30 text-error px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">stop_circle</span>
            <span className="hidden sm:block">End</span>
          </button>
        )}
      </div>
    </div>
  )
}
