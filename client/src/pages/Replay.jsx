import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Replay() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [snapshots, setSnapshots] = useState([])
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)
  const { user } = useAuth()

  // Redirect candidates — replay is interviewer only
  useEffect(() => {
    if (user && user.role !== 'interviewer') {
      navigate('/dashboard')
    }
  }, [user])

  useEffect(() => { fetchSnapshots() }, [])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => {
          if (prev >= snapshots.length - 1) {
            setPlaying(false)
            clearInterval(intervalRef.current)
            return prev
          }
          return prev + 1
        })
      }, 1500)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, snapshots.length])

  const fetchSnapshots = async () => {
    try {
      const res = await api.get(`/api/sessions/${roomId}/snapshots`)
      setSnapshots(res.data.snapshots)
    } catch {
      alert('Failed to load replay')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSlider = (e) => {
    setPlaying(false)
    setCurrent(Number(e.target.value))
  }

  const snapshot = snapshots[current]
  const progress = snapshots.length > 1 ? (current / (snapshots.length - 1)) * 100 : 0

  if (loading) return (
    <div className="h-screen bg-background flex items-center justify-center text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading replay…</p>
      </div>
    </div>
  )

  if (snapshots.length === 0) return (
    <div className="h-screen bg-background flex items-center justify-center text-on-surface">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-outline text-[48px] block">history</span>
        <p className="text-on-surface-variant">No snapshots found for this session.</p>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:text-primary-fixed-dim text-sm font-medium">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-background text-on-surface flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-outline-variant bg-surface-container shrink-0">
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
            <span className="material-symbols-outlined text-secondary text-[18px]">play_circle</span>
            <span className="font-semibold text-sm text-on-surface">Session Replay</span>
          </div>
          <span className="text-xs text-on-surface-variant font-mono opacity-60 hidden sm:block">{roomId.slice(0, 8)}…</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="bg-surface-container-high border border-outline-variant px-2 py-1 rounded-lg font-mono">
            {snapshot?.language}
          </span>
          <span>{snapshots.length} snapshots</span>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={snapshot?.language === 'cpp' ? 'cpp' : snapshot?.language}
          value={snapshot?.code || ''}
          theme="vs-dark"
          options={{
            readOnly: true,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            renderLineHighlight: 'none',
          }}
        />
      </div>

      {/* Replay Controls */}
      <div className="border-t border-outline-variant bg-surface-container px-5 py-4 space-y-3 shrink-0">
        {/* Info row */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>
              {snapshot ? new Date(snapshot.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              }) : '—'}
            </span>
            {snapshot?.triggeredBy && (
              <span className="bg-surface-container-high border border-outline-variant px-2 py-0.5 rounded-full">
                {snapshot.triggeredBy}
              </span>
            )}
          </div>
          <span className="font-mono font-semibold text-on-surface">
            {current + 1} <span className="text-on-surface-variant font-normal">/ {snapshots.length}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-1.5 bg-outline-variant rounded-full">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={snapshots.length - 1}
            value={current}
            onChange={handleSlider}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
          />
        </div>

        {/* Playback buttons */}
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => { setPlaying(false); setCurrent(0) }}
            className="flex items-center gap-1.5 text-xs bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">skip_previous</span>
            Reset
          </button>
          <button
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 text-xs bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">navigate_before</span>
            Prev
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className={`flex items-center gap-2 text-sm px-5 py-2 rounded-xl font-medium transition-colors ${
              playing
                ? 'bg-tertiary/20 border border-tertiary/40 text-tertiary hover:bg-tertiary/30'
                : 'bg-secondary text-on-secondary hover:bg-secondary/90'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{playing ? 'pause' : 'play_arrow'}</span>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setCurrent((p) => Math.min(snapshots.length - 1, p + 1))}
            disabled={current === snapshots.length - 1}
            className="flex items-center gap-1.5 text-xs bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <span className="material-symbols-outlined text-[16px]">navigate_next</span>
          </button>
        </div>
      </div>
    </div>
  )
}
