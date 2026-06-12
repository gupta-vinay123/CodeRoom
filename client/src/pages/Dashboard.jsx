import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const LANGUAGES = ['javascript', 'python', 'cpp', 'java', 'go']

const statusConfig = {
  waiting: { label: 'Waiting', color: 'text-tertiary', bg: 'bg-tertiary/10', dot: 'bg-tertiary' },
  active:  { label: 'Active',  color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', dot: 'bg-[#10B981] animate-pulse' },
  ended:   { label: 'Ended',   color: 'text-on-surface-variant', bg: 'bg-surface-variant', dot: 'bg-outline' },
}

const langIcons = { javascript: 'JS', python: 'PY', cpp: 'C++', java: 'JV', go: 'GO' }

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchMyRooms() }, [])

  const fetchMyRooms = async () => {
    setRoomsLoading(true)
    try {
      const res = await api.get('/api/rooms/my')
      setRooms(res.data)
    } catch {
      console.error('Failed to fetch rooms')
    } finally {
      setRoomsLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/rooms/create', { language })
      navigate(`/room/${res.data.roomId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/rooms/join', { joinCode: joinCode.trim().toUpperCase() })
      navigate(`/room/${res.data.roomId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid join code or room not found')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activeRooms = rooms.filter(r => r.status !== 'ended')
  const pastRooms = rooms.filter(r => r.status === 'ended')

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-primary tracking-tight">CodeRoom</span>
            <span className="text-outline text-sm">|</span>
            <span className="text-xs text-on-surface-variant capitalize bg-surface-container px-2 py-1 rounded-full border border-outline-variant">
              {user?.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[16px]">person</span>
              </div>
              <span className="text-sm text-on-surface-variant hidden sm:block">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface border border-outline-variant hover:border-outline px-3 py-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-error/10 border border-error/30 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">error</span>
            <p className="text-sm text-error">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-error/60 hover:text-error">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {user?.role === 'interviewer'
              ? 'Create a room to start an interview session.'
              : 'Join a room using an invite code from your interviewer.'}
          </p>
        </div>

        {/* Action Cards */}
        <div className={`grid gap-5 ${user?.role === 'interviewer' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Create Room — interviewer only */}
          {user?.role === 'interviewer' && <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 space-y-5 hover:border-primary/40 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                  </div>
                  <h2 className="font-semibold text-on-surface">Create Room</h2>
                </div>
                <p className="text-xs text-on-surface-variant pl-11">Start a new session and invite a candidate</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wide">Language</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all
                      ${language === lang
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline hover:text-on-surface'
                      }`}
                  >
                    {langIcons[lang]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant font-mono">
                Selected: <span className="text-primary">{language}</span>
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium text-sm hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />Creating...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">add</span>Create Room</>
              )}
            </button>
          </div>}

          {/* Join Room */}
          <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 space-y-5 hover:border-[#10B981]/40 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/20 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#10B981] text-[20px]">login</span>
                  </div>
                  <h2 className="font-semibold text-on-surface">Join Room</h2>
                </div>
                <p className="text-xs text-on-surface-variant pl-11">Enter a 6-character code to join a session</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wide">Join Code</label>
              <input
                type="text"
                placeholder="e.g. AB12CD"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && joinCode.length === 6 && handleJoinRoom()}
                className="w-full bg-surface-container-high text-on-surface px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-[#10B981] focus:bg-surface-container transition-colors text-center text-2xl font-mono font-bold tracking-[0.5em] text-primary"
              />
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < joinCode.length ? 'bg-primary' : 'bg-outline-variant'}`} />
                ))}
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={loading || joinCode.length < 6}
              className="w-full bg-[#10B981] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">arrow_forward</span>Join Room</>
              )}
            </button>
          </div>
        </div>

        {/* Active Rooms */}
        {activeRooms.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <h2 className="font-semibold text-on-surface">Active Sessions</h2>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">{activeRooms.length}</span>
            </div>
            <div className="space-y-3">
              {activeRooms.map((room) => (
                <RoomCard key={room.roomId} room={room} navigate={navigate} user={user} />
              ))}
            </div>
          </section>
        )}

        {/* Past Sessions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
            <h2 className="font-semibold text-on-surface">Past Sessions</h2>
            {!roomsLoading && (
              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">{pastRooms.length}</span>
            )}
          </div>

          {roomsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container border border-outline-variant rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : pastRooms.length === 0 ? (
            <div className="bg-surface-container border border-outline-variant rounded-2xl px-6 py-12 text-center space-y-2">
              <span className="material-symbols-outlined text-outline text-[40px] block">code_blocks</span>
              <p className="text-on-surface-variant text-sm">No past sessions yet.</p>
              <p className="text-outline text-xs">Sessions you create or join will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastRooms.map((room) => (
                <RoomCard key={room.roomId} room={room} navigate={navigate} user={user} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function RoomCard({ room, navigate, user }) {
  const s = statusConfig[room.status] || statusConfig.ended
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl px-5 py-4 flex items-center justify-between hover:border-outline transition-colors group">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant font-mono text-xs font-bold text-primary shrink-0">
          {(room.language ? langIcons[room.language] : '?') || '?'}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono font-bold text-sm text-on-surface tracking-wider">{room.joinCode}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {new Date(room.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
            {' · '}{room.participantIds.length} participant{room.participantIds.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {room.status === 'ended' ? (
        user?.role === 'interviewer' && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/replay/${room.roomId}`)}
              className="text-xs bg-surface-container-high hover:bg-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg text-secondary font-medium transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">play_circle</span>
              Replay
            </button>
            <button
              onClick={() => navigate(`/review/${room.roomId}`)}
              className="text-xs bg-surface-container-high hover:bg-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg text-primary font-medium transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">rate_review</span>
              Review
            </button>
          </div>
        )
      ) : (
        <button
          onClick={() => navigate(`/room/${room.roomId}`)}
          className="text-xs bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg text-primary font-medium transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          Rejoin
        </button>
      )}
    </div>
  )
}
