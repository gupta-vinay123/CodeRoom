import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'participant' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'participant', label: 'Candidate', icon: 'person', desc: 'Solve problems in live sessions' },
    { value: 'interviewer', label: 'Interviewer', icon: 'groups', desc: 'Conduct and review interviews' },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/8 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-bold text-2xl text-primary tracking-tight">CodeRoom</span>
          </Link>
          <p className="text-on-surface-variant text-sm mt-2">Create your free account</p>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-error/10 border border-error/30 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">error</span>
              <p className="text-sm text-error leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">badge</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Chen"
                  className="w-full bg-surface-container-high text-on-surface pl-10 pr-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:bg-surface-container transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wide">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full bg-surface-container-high text-on-surface pl-10 pr-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:bg-surface-container transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wide">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">lock</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-surface-container-high text-on-surface pl-10 pr-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:bg-surface-container transition-colors text-sm"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wide">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                      ${form.role === r.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-outline hover:text-on-surface'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{r.icon}</span>
                    <span className="text-xs font-semibold">{r.label}</span>
                    <span className="text-[10px] opacity-70 leading-tight">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium text-sm hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-fixed-dim font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
