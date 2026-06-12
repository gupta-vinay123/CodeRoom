import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import Replay from './pages/Replay'
import Home from './pages/Home'
import api from './api/axios'
import Review from './pages/Review'

function JoinRedirect() {
  const { joinCode } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    api.post('/api/rooms/join', { joinCode })
      .then(res => navigate(`/room/${res.data.roomId}`))
      .catch(() => navigate('/dashboard'))
  }, [])

  return (
    <div className="h-screen bg-background flex items-center justify-center text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Joining room…</p>
      </div>
    </div>
  )
}

function AppGate() {
  const { loading } = useAuth()
  if (loading) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="font-bold text-2xl text-primary tracking-tight">CodeRoom</span>
        <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  )
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/room/:roomId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
      <Route path="/replay/:roomId" element={<ProtectedRoute><Replay /></ProtectedRoute>} />
      <Route path="/join/:joinCode" element={<ProtectedRoute><JoinRedirect /></ProtectedRoute>} />
      <Route path="/review/:roomId" element={<ProtectedRoute><Review /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppGate />
      </BrowserRouter>
    </AuthProvider>
  )
}
