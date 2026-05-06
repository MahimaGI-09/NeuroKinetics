import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'patient' | 'therapist'>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password, role }),
      })
      const data = await res.json()
      if (res.ok) {
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const loginData = await loginRes.json()
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.access_token)
          navigate('/dashboard')
        } else {
          navigate('/login')
        }
      } else {
        setError(data.detail || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Cannot reach the server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon">⚡</div>
          <h1 className="section-title" style={{ fontSize: '2.5rem' }}>Get Started</h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            Create your account and start your recovery
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-fields">
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Aravind Kumar"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">I am a...</label>
            <div className="auth-role-toggle">
              <button
                className={`role-btn cursor-target ${role === 'patient' ? 'active' : ''}`}
                onClick={() => setRole('patient')}
                type="button"
              >
                🤕 Patient
              </button>
              <button
                className={`role-btn cursor-target ${role === 'therapist' ? 'active' : ''}`}
                onClick={() => setRole('therapist')}
                type="button"
              >
                🩺 Therapist
              </button>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary cursor-target"
          style={{ width: '100%', marginTop: '8px' }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="cursor-target">Log In</Link>
        </p>
      </div>
    </section>
  )
}
