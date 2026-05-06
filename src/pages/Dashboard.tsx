import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type Role = 'patient' | 'therapist'

type User = {
  id: number
  email: string
  full_name: string
  role: Role
  xp_total: number
  level: number
  streak_days: number
  therapist_id: number | null
}

type Session = {
  id: number
  patient_id: number
  level: number
  exercise_name: string
  duration_secs: number
  score_pct: number
  xp_earned: number
  finger_angles?: Record<string, number[]> | null
  heart_rate?: number | null
  spo2?: number | null
  therapist_note?: string | null
  created_at: string
}

type PatientStats = {
  patient_id: number
  full_name: string
  xp_total: number
  level: number
  streak_days: number
  total_sessions: number
  avg_score_pct: number
  total_xp_from_sessions: number
}

const exercises = ['Finger Spread', 'Basic Curl', 'Pinch Grip', 'Power Grip', 'Object Pickup']

const defaultAngles = {
  thumb: [68],
  index: [72],
  middle: [45],
  ring: [58],
  pinky: [32],
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [patients, setPatients] = useState<User[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [selectedStats, setSelectedStats] = useState<PatientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [exerciseName, setExerciseName] = useState(exercises[0])
  const [scorePct, setScorePct] = useState(82)
  const [durationSecs, setDurationSecs] = useState(300)
  const [sessionLevel, setSessionLevel] = useState(1)
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({})

  const selectedPatient = useMemo(
    () => patients.find(patient => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  )

  async function api<T>(path: string, options: RequestInit = {}) {
    if (!token) throw new Error('Missing login token')
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...authHeaders(token),
        ...(options.headers ?? {}),
      },
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.detail ?? 'Request failed')
    }
    return data as T
  }

  async function loadPatientDashboard() {
    const [me, mySessions] = await Promise.all([
      api<User>('/api/users/me'),
      api<Session[]>('/api/sessions/my?limit=20'),
    ])
    setUser(me)
    setSessions(mySessions)
    setSessionLevel(me.level)
  }

  async function loadTherapistDashboard(me: User) {
    const patientList = await api<User[]>('/api/users/all-patients')
    setPatients(patientList)
    const firstPatientId = patientList[0]?.id ?? null
    setSelectedPatientId(current => current ?? firstPatientId)
    if (firstPatientId) {
      await loadPatientForTherapist(firstPatientId)
    }
    setUser(me)
  }

  async function loadPatientForTherapist(patientId: number) {
    const [stats, patientSessions] = await Promise.all([
      api<PatientStats>(`/api/sessions/stats/${patientId}`),
      api<Session[]>(`/api/sessions/patient/${patientId}?limit=20`),
    ])
    setSelectedStats(stats)
    setSessions(patientSessions)
    setNoteDrafts(
      patientSessions.reduce<Record<number, string>>((drafts, session) => {
        drafts[session.id] = session.therapist_note ?? ''
        return drafts
      }, {}),
    )
  }

  async function refreshDashboard() {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const me = await api<User>('/api/users/me')
      if (me.role === 'therapist') {
        await loadTherapistDashboard(me)
      } else {
        await loadPatientDashboard()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogSession() {
    setSaving(true)
    setError('')
    try {
      await api<Session>('/api/sessions/', {
        method: 'POST',
        body: JSON.stringify({
          level: sessionLevel,
          exercise_name: exerciseName,
          score_pct: scorePct,
          duration_secs: durationSecs,
          finger_angles: defaultAngles,
          heart_rate: 78,
          spo2: 98,
        }),
      })
      await loadPatientDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log session')
    } finally {
      setSaving(false)
    }
  }

  async function handlePatientSelect(patientId: number) {
    setSelectedPatientId(patientId)
    setError('')
    try {
      await loadPatientForTherapist(patientId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load patient')
    }
  }

  async function handleSaveNote(sessionId: number) {
    setSaving(true)
    setError('')
    try {
      await api<Session>(`/api/sessions/${sessionId}/note`, {
        method: 'PATCH',
        body: JSON.stringify({ note: noteDrafts[sessionId] ?? '' }),
      })
      if (selectedPatientId) {
        await loadPatientForTherapist(selectedPatientId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save note')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!token) {
    return (
      <section className="role-dashboard">
        <div className="container">
          <div className="dashboard-empty card">
            <p className="pixel-heading">Dashboard locked</p>
            <h1 className="section-title">Log in to view your dashboard</h1>
            <p className="section-subtitle">Patients can log exercise sessions. Therapists can review patient progress and add notes.</p>
            <Link to="/login" className="btn btn-primary cursor-target">Log In</Link>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="role-dashboard">
        <div className="container">
          <div className="dashboard-empty card">Loading dashboard...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="role-dashboard">
      <div className="container">
        <div className="dashboard-title-row">
          <div>
            <p className="pixel-heading">{user?.role === 'therapist' ? 'Therapist Workspace' : 'Patient Dashboard'}</p>
            <h1 className="section-title">
              {user?.role === 'therapist' ? 'Patient Progress' : `Welcome, ${user?.full_name}`}
            </h1>
            <p className="section-subtitle">
              {user?.role === 'therapist'
                ? 'Select a patient, review their session history, and leave clinical notes.'
                : 'Log exercises, track XP, and watch your recovery progress grow.'}
            </p>
          </div>
          <button className="btn btn-secondary cursor-target" onClick={handleLogout}>Log Out</button>
        </div>

        {error && <div className="auth-error dashboard-error">{error}</div>}

        {user?.role === 'therapist' ? (
          <TherapistDashboard
            patients={patients}
            selectedPatient={selectedPatient}
            selectedPatientId={selectedPatientId}
            selectedStats={selectedStats}
            sessions={sessions}
            noteDrafts={noteDrafts}
            saving={saving}
            onPatientSelect={handlePatientSelect}
            onNoteChange={(sessionId, value) => setNoteDrafts(current => ({ ...current, [sessionId]: value }))}
            onSaveNote={handleSaveNote}
          />
        ) : (
          <PatientDashboard
            user={user}
            sessions={sessions}
            exerciseName={exerciseName}
            scorePct={scorePct}
            durationSecs={durationSecs}
            sessionLevel={sessionLevel}
            saving={saving}
            onExerciseNameChange={setExerciseName}
            onScorePctChange={setScorePct}
            onDurationSecsChange={setDurationSecs}
            onSessionLevelChange={setSessionLevel}
            onLogSession={handleLogSession}
          />
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="dash-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PatientDashboard({
  user,
  sessions,
  exerciseName,
  scorePct,
  durationSecs,
  sessionLevel,
  saving,
  onExerciseNameChange,
  onScorePctChange,
  onDurationSecsChange,
  onSessionLevelChange,
  onLogSession,
}: {
  user: User | null
  sessions: Session[]
  exerciseName: string
  scorePct: number
  durationSecs: number
  sessionLevel: number
  saving: boolean
  onExerciseNameChange: (value: string) => void
  onScorePctChange: (value: number) => void
  onDurationSecsChange: (value: number) => void
  onSessionLevelChange: (value: number) => void
  onLogSession: () => void
}) {
  return (
    <>
      <div className="dash-stat-grid">
        <StatCard label="Total XP" value={user?.xp_total ?? 0} />
        <StatCard label="Current Level" value={user?.level ?? 1} />
        <StatCard label="Streak" value={`${user?.streak_days ?? 0} days`} />
        <StatCard label="Sessions" value={sessions.length} />
      </div>

      <div className="dashboard-workspace">
        <div className="dashboard-form-card card">
          <h2>Log Exercise Session</h2>
          <label>
            Exercise
            <select value={exerciseName} onChange={event => onExerciseNameChange(event.target.value)}>
              {exercises.map(exercise => <option key={exercise}>{exercise}</option>)}
            </select>
          </label>
          <label>
            Level
            <input min="1" max="10" type="number" value={sessionLevel} onChange={event => onSessionLevelChange(Number(event.target.value))} />
          </label>
          <label>
            Score %
            <input min="0" max="100" type="number" value={scorePct} onChange={event => onScorePctChange(Number(event.target.value))} />
          </label>
          <label>
            Duration seconds
            <input min="10" type="number" value={durationSecs} onChange={event => onDurationSecsChange(Number(event.target.value))} />
          </label>
          <button className="btn btn-primary cursor-target" onClick={onLogSession} disabled={saving}>
            {saving ? 'Saving...' : 'Log Session'}
          </button>
        </div>

        <SessionHistory sessions={sessions} title="Session History" />
      </div>
    </>
  )
}

function TherapistDashboard({
  patients,
  selectedPatient,
  selectedPatientId,
  selectedStats,
  sessions,
  noteDrafts,
  saving,
  onPatientSelect,
  onNoteChange,
  onSaveNote,
}: {
  patients: User[]
  selectedPatient: User | null
  selectedPatientId: number | null
  selectedStats: PatientStats | null
  sessions: Session[]
  noteDrafts: Record<number, string>
  saving: boolean
  onPatientSelect: (patientId: number) => void
  onNoteChange: (sessionId: number, value: string) => void
  onSaveNote: (sessionId: number) => void
}) {
  if (!patients.length) {
    return <div className="dashboard-empty card">No patient accounts yet. Register a patient to see therapist controls.</div>
  }

  return (
    <>
      <div className="therapist-selector card">
        <label>
          Active patient
          <select value={selectedPatientId ?? ''} onChange={event => onPatientSelect(Number(event.target.value))}>
            {patients.map(patient => (
              <option value={patient.id} key={patient.id}>{patient.full_name} ({patient.email})</option>
            ))}
          </select>
        </label>
        <div>
          <strong>{selectedPatient?.full_name}</strong>
          <span>{selectedPatient?.email}</span>
        </div>
      </div>

      <div className="dash-stat-grid">
        <StatCard label="Patient XP" value={selectedStats?.xp_total ?? 0} />
        <StatCard label="Level" value={selectedStats?.level ?? 1} />
        <StatCard label="Avg Score" value={`${selectedStats?.avg_score_pct ?? 0}%`} />
        <StatCard label="Sessions" value={selectedStats?.total_sessions ?? 0} />
      </div>

      <div className="dashboard-workspace therapist-workspace">
        <SessionHistory sessions={sessions} title="Patient Session History" />
        <div className="dashboard-form-card card">
          <h2>Clinical Notes</h2>
          {sessions.length === 0 ? (
            <p className="muted-copy">No sessions available for notes yet.</p>
          ) : (
            <div className="note-list">
              {sessions.slice(0, 5).map(session => (
                <div className="note-item" key={session.id}>
                  <div>
                    <strong>{session.exercise_name}</strong>
                    <span>{formatDate(session.created_at)}</span>
                  </div>
                  <textarea
                    value={noteDrafts[session.id] ?? ''}
                    onChange={event => onNoteChange(session.id, event.target.value)}
                    placeholder="Add therapist note..."
                  />
                  <button className="btn btn-secondary cursor-target" onClick={() => onSaveNote(session.id)} disabled={saving}>
                    Save Note
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function SessionHistory({ sessions, title }: { sessions: Session[]; title: string }) {
  return (
    <div className="session-history-card card">
      <h2>{title}</h2>
      {sessions.length === 0 ? (
        <p className="muted-copy">No exercise sessions logged yet.</p>
      ) : (
        <div className="session-list">
          {sessions.map(session => (
            <div className="session-row" key={session.id}>
              <div>
                <strong>{session.exercise_name}</strong>
                <span>{formatDate(session.created_at)}</span>
                {session.therapist_note && <em>{session.therapist_note}</em>}
              </div>
              <div className="session-meta">
                <b>+{session.xp_earned} XP</b>
                <span>{session.score_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
