import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.access_token)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'Login failed. Please try again.')
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
          <div className="auth-icon">🧤</div>
          <h1 className="section-title" style={{ fontSize: '2.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            Log in to continue your rehabilitation journey
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-fields">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </div>

        <button
          className="btn btn-primary cursor-target"
          style={{ width: '100%', marginTop: '8px' }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In →'}
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="cursor-target">Get Started</Link>
        </p>
      </div>
    </section>
  )
}
