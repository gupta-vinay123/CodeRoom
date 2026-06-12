import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          // include name if stored, plus any payload fields
          const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
          setUser({ id: payload.id, role: payload.role, name: storedUser.name || payload.name || '' })
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('userInfo')
        }
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userInfo')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/api/auth/register', { name, email, password, role })
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try { await api.post('/api/auth/logout') } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
