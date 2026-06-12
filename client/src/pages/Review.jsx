import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const SECTION_ICONS = {
  'Code Quality': 'code_blocks',
  'Time Complexity': 'speed',
  'Space Complexity': 'memory',
  'Edge Cases': 'bug_report',
  'Overall Verdict': 'gavel',
  'Strengths': 'thumb_up',
  'Improvements': 'construction',
}

export default function Review() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Redirect candidates — review is interviewer only
  useEffect(() => {
    if (user && user.role !== 'interviewer') {
      navigate('/dashboard')
    }
  }, [user])

  useEffect(() => {
    api.get(`/api/rooms/${roomId}`)
      .then(res => {
        setReview(res.data.codeReview || '')
        setLoading(false)
      })
      .catch(() => navigate('/dashboard'))
  }, [roomId])

  if (loading) return (
    <div className="h-screen bg-background flex items-center justify-center text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading AI review…</p>
      </div>
    </div>
  )

  const sections = review.split('## ').filter(s => s.trim())

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Dashboard
            </button>
            <span className="text-outline">|</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">rate_review</span>
              <span className="font-semibold text-sm">AI Code Review</span>
            </div>
          </div>
          <span className="text-xs text-on-surface-variant font-mono hidden sm:block opacity-60">{roomId.slice(0, 8)}…</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {/* Subtitle */}
        <p className="text-on-surface-variant text-sm">Post-session AI analysis of the candidate's code</p>

        {review ? (
          <div className="space-y-4">
            {sections.map((section, i) => {
              const lines = section.split('\n').filter(l => l.trim())
              const title = lines[0]
              const content = lines.slice(1).join('\n').trim()
              const isVerdict = title === 'Overall Verdict'
              const isHire = content.toLowerCase().includes('hire') && !content.toLowerCase().includes('no hire')
              const icon = SECTION_ICONS[title] || 'description'

              return (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 space-y-3 ${
                    isVerdict
                      ? isHire
                        ? 'bg-[#10B981]/8 border-[#10B981]/30'
                        : 'bg-error/8 border-error/30'
                      : 'bg-surface-container border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${
                      isVerdict ? (isHire ? 'text-[#10B981]' : 'text-error') : 'text-primary'
                    }`}>
                      {icon}
                    </span>
                    <h2 className={`text-xs font-bold uppercase tracking-widest ${
                      isVerdict ? (isHire ? 'text-[#10B981]' : 'text-error') : 'text-primary'
                    }`}>
                      {title}
                    </h2>
                    {isVerdict && (
                      <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full border ${
                        isHire
                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                          : 'bg-error/10 text-error border-error/30'
                      }`}>
                        {isHire ? '✓ Hire' : '✗ No Hire'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {content.split('\n').map((line, j) => {
                      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*')
                      const isComplexity = line.includes('O(')
                      return (
                        <p
                          key={j}
                          className={`text-sm leading-relaxed ${
                            isBullet ? 'text-on-surface pl-3 flex gap-2' :
                            isComplexity ? 'text-tertiary font-mono bg-tertiary/10 px-3 py-1 rounded-lg inline-block' :
                            'text-on-surface-variant'
                          }`}
                        >
                          {isBullet ? (
                            <>
                              <span className="text-outline shrink-0 mt-0.5">•</span>
                              <span>{line.replace(/^[-*]\s*/, '')}</span>
                            </>
                          ) : line}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-surface-container border border-outline-variant rounded-2xl p-10 text-center space-y-3">
            <span className="material-symbols-outlined text-outline text-[40px] block">rate_review</span>
            <p className="text-on-surface-variant">No review available for this session.</p>
            <p className="text-outline text-sm">Reviews are generated automatically when the interviewer ends the session.</p>
          </div>
        )}
      </main>
    </div>
  )
}
