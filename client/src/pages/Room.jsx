import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { useAuth } from '../context/AuthContext'
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket'
import api from '../api/axios'
import ChatPanel from '../components/room/ChatPanel'
import ExecutionPanel from '../components/room/ExecutionPanel'
import RoomHeader from '../components/room/RoomHeader'
import HintPanel from '../components/room/HintPanel'
import CopilotPanel from '../components/room/CopilotPanel'

const USER_COLORS = ['#adc6ff', '#f97316']

const TAB_CONFIG = {
  chat:      { icon: 'chat',          label: 'Chat' },
  execution: { icon: 'terminal',      label: 'Output' },
  hint:      { icon: 'lightbulb',     label: 'Hint' },
  copilot:   { icon: 'smart_toy',     label: 'Copilot' },
}

export default function Room() {
  const { roomId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const decorationsRef = useRef([])
  const isRemoteChange = useRef(false)
  const savedCode = useRef({})

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [problem, setProblem] = useState('')
  const [editingProblem, setEditingProblem] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const [stdin, setStdin] = useState('')
  const [executionResult, setExecutionResult] = useState(null)
  const [executing, setExecuting] = useState(false)
  const [hint, setHint] = useState('')
  const [followup, setFollowup] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const tabs = user?.role === 'interviewer'
    ? ['chat', 'execution', 'hint', 'copilot']
    : ['chat', 'execution', 'hint']

  useEffect(() => {
    api.get(`/api/rooms/${roomId}`).then(res => {
      setJoinCode(res.data.joinCode)
    }).catch(() => {})
  }, [roomId])

  useEffect(() => {
    const socket = connectSocket()

    if (socket.connected) {
      setConnected(true)
      socket.emit('room:join', { roomId })
    }

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('room:join', { roomId })
    })

    socket.on('room:joined', ({ code, language, problemStatement }) => {
      setCode(code || '')
      setLanguage(language || 'javascript')
      setProblem(problemStatement || '')
    })

    socket.on('room:activeUsers', ({ users }) => setActiveUsers(users))
    socket.on('room:userJoined', () => {})
    socket.on('room:userLeft', () => {})

    socket.on('editor:change', ({ code: remoteCode }) => {
      isRemoteChange.current = true
      setCode(remoteCode)
    })

    socket.on('cursor:move', ({ userId, position, color }) => {
      renderRemoteCursor(position, color, userId)
    })

    socket.on('language:change', ({ language }) => setLanguage(language))
    socket.on('problem:set', ({ problemStatement }) => setProblem(problemStatement))

    socket.on('execution:result', (result) => {
      setExecutionResult(result)
      setExecuting(false)
      setActiveTab('execution')
    })
    socket.on('execution:error', ({ message }) => {
      setExecutionResult({ error: message })
      setExecuting(false)
    })

    socket.on('ai:hint', ({ result }) => {
      setHint(result)
      setActiveTab('hint')
    })

    socket.on('ai:followup', ({ result }) => {
      setFollowup(result)
      setActiveTab('copilot')
    })

    socket.on('disconnect', () => setConnected(false))
    socket.on('room:error', ({ message }) => {
      alert(message)
      navigate('/dashboard')
    })

    socket.on('room:ended', () => {
      alert('The interviewer has ended the session.')
      navigate('/dashboard')
    })

    return () => {
      socket.emit('room:leave')
      disconnectSocket()
    }
  }, [roomId])

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editor.onDidChangeCursorPosition((e) => {
      getSocket().emit('cursor:move', {
        roomId,
        position: e.position,
        color: USER_COLORS[0],
      })
    })
  }

  const handleCodeChange = useCallback((value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false
      return
    }
    setCode(value || '')
    getSocket().emit('editor:change', { roomId, code: value || '' })
  }, [roomId])

  const renderRemoteCursor = (position, color, userId) => {
    if (!editorRef.current || !monacoRef.current) return
    const monaco = monacoRef.current
    const newDecorations = editorRef.current.deltaDecorations(
      decorationsRef.current,
      [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1),
        options: {
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          zIndex: 10,
          after: { content: ' ', inlineClassName: `remote-cursor-${userId}` },
        },
      }]
    )
    decorationsRef.current = newDecorations
  }

  const handleLanguageChange = (lang) => {
    savedCode.current[language] = code
    setLanguage(lang)
    const restored = savedCode.current[lang] || ''
    setCode(restored)
    getSocket().emit('language:change', { roomId, language: lang })
    getSocket().emit('editor:change', { roomId, code: restored })
  }

  const handleRunCode = async () => {
    if (!code.trim()) return
    setExecuting(true)
    setExecutionResult(null)
    await api.post('/api/execution/run', { roomId, code, language, stdin })
  }

  const handleGetHint = async () => {
    await api.post('/api/ai/hint', { roomId, code, problem })
  }

  const handleGetFollowup = async () => {
    await api.post('/api/ai/followup', { roomId, code, problem })
  }

  const handleEndRoom = async () => {
    if (!confirm('End this session? This will trigger an AI code review.')) return
    if (code.trim()) {
      await api.post('/api/ai/review', { roomId, code, language })
    }
    await api.patch(`/api/rooms/${roomId}/end`)
    navigate('/dashboard')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${joinCode}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="h-screen bg-background text-on-surface flex flex-col">
      <RoomHeader
        roomId={roomId}
        language={language}
        onLanguageChange={handleLanguageChange}
        activeUsers={activeUsers}
        connected={connected}
        onRunCode={handleRunCode}
        onGetHint={handleGetHint}
        onGetFollowup={handleGetFollowup}
        onEndRoom={handleEndRoom}
        executing={executing}
        userRole={user?.role}
      />

      {/* Waiting Lobby Overlay */}
      {activeUsers.length < 2 && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 text-center space-y-6 max-w-sm w-full mx-4 shadow-2xl">
            {/* Animated ring */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className={`w-16 h-16 rounded-full border-4 border-outline-variant animate-spin absolute inset-0 ${user?.role === 'interviewer' ? 'border-t-primary' : 'border-t-[#10B981]'}`} />
                <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {user?.role === 'interviewer' ? 'people' : 'schedule'}
                  </span>
                </div>
              </div>
            </div>

            {user?.role === 'interviewer' ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-on-surface">Waiting for participant…</h2>
                  <p className="text-on-surface-variant text-sm">Share the join code or invite link below</p>
                </div>

                {/* Join code display */}
                <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Join Code</p>
                  <p className="text-4xl font-mono font-bold text-primary tracking-[0.3em]">
                    {joinCode || '------'}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCopyCode}
                    className="w-full bg-primary hover:bg-primary-fixed-dim text-on-primary py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">{copiedCode ? 'check' : 'content_copy'}</span>
                    {copiedCode ? 'Copied!' : 'Copy Join Code'}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">{copiedLink ? 'check' : 'link'}</span>
                    {copiedLink ? 'Copied!' : 'Copy Invite Link'}
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full text-on-surface-variant hover:text-on-surface py-2 text-sm transition-colors"
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-on-surface-variant text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  Room is live — waiting for someone to join
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-on-surface">You're in — hold tight</h2>
                  <p className="text-on-surface-variant text-sm">Waiting for the interviewer to join the session</p>
                </div>

                <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Session</p>
                  <p className="text-sm font-mono font-semibold text-on-surface">{roomId.slice(0, 16)}…</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Leave Room
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-on-surface-variant text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  Connected — interviewer hasn't joined yet
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem Panel */}
        <div className="w-72 border-r border-outline-variant flex flex-col overflow-hidden shrink-0">
          <div className="px-4 py-2.5 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface-container">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">description</span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Problem</span>
            </div>
            {user?.role === 'interviewer' && (
              <button
                onClick={() => setEditingProblem(p => !p)}
                className={`text-xs font-medium transition-colors flex items-center gap-1 px-2 py-1 rounded-lg
                  ${editingProblem
                    ? 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30'
                    : 'text-primary hover:bg-primary/10'
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">{editingProblem ? 'check' : 'edit'}</span>
                {editingProblem ? 'Save' : 'Edit'}
              </button>
            )}
          </div>
          {editingProblem ? (
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              onBlur={() => {
                getSocket().emit('problem:set', { roomId, problemStatement: problem })
                setEditingProblem(false)
              }}
              className="flex-1 bg-transparent text-sm text-on-surface p-4 resize-none focus:outline-none font-mono leading-relaxed"
              placeholder="Paste problem statement here…"
              autoFocus
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {problem || (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
                  <span className="material-symbols-outlined text-outline text-[32px]">description</span>
                  <p className="text-xs text-outline">
                    {user?.role === 'interviewer' ? 'Click Edit to set a problem statement.' : 'No problem set yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true,
              renderLineHighlight: 'gutter',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        </div>

        {/* Right: Tabbed Panel */}
        <div className="w-80 border-l border-outline-variant flex flex-col overflow-hidden shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant shrink-0 bg-surface-container">
            {tabs.map((tab) => {
              const cfg = TAB_CONFIG[tab]
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors border-b-2
                    ${activeTab === tab
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-variant'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && <ChatPanel roomId={roomId} userId={user?.id} />}
            {activeTab === 'execution' && (
              <ExecutionPanel
                result={executionResult}
                stdin={stdin}
                onStdinChange={setStdin}
                executing={executing}
              />
            )}
            {activeTab === 'hint' && <HintPanel hint={hint} />}
            {activeTab === 'copilot' && <CopilotPanel followup={followup} />}
          </div>
        </div>
      </div>
    </div>
  )
}
