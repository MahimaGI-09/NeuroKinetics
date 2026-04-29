import { useState, useEffect } from 'react'
import './App.css'

/* ── Animated Hand SVG Component ── */
function HandSVG() {
  const [angles, setAngles] = useState([45, 60, 35, 50, 40])

  useEffect(() => {
    const interval = setInterval(() => {
      setAngles(prev => prev.map(a => {
        const delta = (Math.random() - 0.5) * 8
        return Math.max(10, Math.min(90, a + delta))
      }))
    }, 150)
    return () => clearInterval(interval)
  }, [])

  const getColor = (angle: number) => {
    if (angle >= 60) return '#22c55e'
    if (angle >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const fingerPaths = [
    { x: 95, label: 'Thumb' },
    { x: 135, label: 'Index' },
    { x: 175, label: 'Middle' },
    { x: 215, label: 'Ring' },
    { x: 255, label: 'Pinky' },
  ]

  return (
    <svg viewBox="0 0 350 440" fill="none" style={{ width: '100%', height: '100%' }}>
      {/* Wrist / Palm base */}
      <rect x="90" y="260" width="170" height="140" rx="20" fill="#141432" stroke="#00f0ff" strokeWidth="1.5" opacity="0.8" />
      <rect x="100" y="270" width="150" height="120" rx="14" fill="rgba(0,240,255,0.03)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />

      {/* Grid lines on palm */}
      {[290, 310, 330, 350, 370].map((y, i) => (
        <line key={`h-${i}`} x1="105" y1={y} x2="245" y2={y} stroke="rgba(0,240,255,0.06)" strokeWidth="0.5" />
      ))}
      {[120, 140, 160, 180, 200, 220].map((x, i) => (
        <line key={`v-${i}`} x1={x} y1="275" x2={x} y2="385" stroke="rgba(0,240,255,0.06)" strokeWidth="0.5" />
      ))}

      {/* Sensor indicators on palm */}
      <circle cx="175" cy="300" r="8" fill="rgba(0,240,255,0.15)" stroke="var(--accent-cyan)" strokeWidth="1">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="330" r="5" fill="rgba(168,85,247,0.15)" stroke="#a855f7" strokeWidth="1">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="210" cy="330" r="5" fill="rgba(168,85,247,0.15)" stroke="#a855f7" strokeWidth="1">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Fingers */}
      {fingerPaths.map((finger, i) => {
        const bendOffset = ((angles[i] - 45) / 45) * 15
        const segH = i === 0 ? 60 : 80
        const segH2 = i === 0 ? 50 : 65
        const baseY = 260
        const color = getColor(angles[i])

        return (
          <g key={finger.label}>
            {/* Lower segment */}
            <rect
              x={finger.x - 12}
              y={baseY - segH}
              width={24}
              height={segH}
              rx={6}
              fill="#141432"
              stroke={color}
              strokeWidth="1.5"
              style={{ transition: 'stroke 0.3s ease' }}
            />
            {/* Sensor dot on lower segment */}
            <circle cx={finger.x} cy={baseY - segH / 2} r="3" fill={color} opacity="0.6">
              <animate attributeName="r" values="2;4;2" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>

            {/* Upper segment */}
            <rect
              x={finger.x - 10 + bendOffset * 0.3}
              y={baseY - segH - segH2 + 5}
              width={20}
              height={segH2}
              rx={5}
              fill="rgba(20,20,50,0.9)"
              stroke={color}
              strokeWidth="1.2"
              style={{
                transition: 'all 0.3s ease',
                transform: `rotate(${bendOffset}deg)`,
                transformOrigin: `${finger.x}px ${baseY - segH}px`
              }}
            />

            {/* Angle label */}
            <text
              x={finger.x}
              y={baseY + 20}
              textAnchor="middle"
              fill={color}
              fontSize="9"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
              style={{ transition: 'fill 0.3s ease' }}
            >
              {Math.round(angles[i])}°
            </text>

            {/* Finger name */}
            <text
              x={finger.x}
              y={baseY + 32}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="6"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="0.5"
            >
              {finger.label.toUpperCase()}
            </text>
          </g>
        )
      })}

      {/* MPU6050 indicator */}
      <rect x="130" y="395" width="90" height="20" rx="4" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.8" />
      <text x="175" y="408" textAnchor="middle" fill="#a855f7" fontSize="6" fontFamily="'JetBrains Mono', monospace">MPU6050 • IMU</text>

      {/* Connection lines */}
      <line x1="175" y1="415" x2="175" y2="435" stroke="rgba(0,240,255,0.2)" strokeWidth="1" strokeDasharray="3,3">
        <animate attributeName="strokeDashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
      </line>
      <text x="175" y="438" textAnchor="middle" fill="#00f0ff" fontSize="5" fontFamily="'VT323', monospace" opacity="0.6">BLE 5.0</text>
    </svg>
  )
}

/* ── Main App ── */
function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app">
      {/* ════ NAVBAR ════ */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <div className="navbar-logo">
            <div className="logo-icon">🧤</div>
            <span className="logo-text">NeuroKinetics</span>
          </div>
          <ul className="navbar-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#levels">Exercises</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#dashboard">Dashboard</a></li>
          </ul>
          <div className="navbar-cta">
            <button className="btn btn-secondary">Log In</button>
            <button className="btn btn-primary">Get Started</button>
          </div>
          <button className="mobile-menu-btn">☰</button>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge">⚡ IoT-Powered Rehabilitation</span>
            </div>
            <h1>
              Smart Hand Rehab,{' '}
              <span className="glow-text">Gamified</span>
            </h1>
            <p className="hero-description">
              Real-time kinematic analysis meets RPG-style progression. Monitor finger movements,
              track recovery, and level up your rehabilitation journey — all from a sensor-equipped glove.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Start Your Journey →</button>
              <button className="btn btn-secondary">Watch Demo ▶</button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">20Hz</div>
                <div className="hero-stat-label">Sensor Refresh</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">5</div>
                <div className="hero-stat-label">Flex Sensors</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">0-90°</div>
                <div className="hero-stat-label">ROM Tracking</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hand-container">
              <div className="hand-glow"></div>
              <HandSVG />
              <div className="floating-data fd-1">
                <div className="data-label">Index Finger</div>
                <div className="data-value green">72° ✓</div>
              </div>
              <div className="floating-data fd-2">
                <div className="data-label">Heart Rate</div>
                <div className="data-value cyan">78 BPM</div>
              </div>
              <div className="floating-data fd-3">
                <div className="data-label">SpO₂</div>
                <div className="data-value green">98%</div>
              </div>
              <div className="floating-data fd-4">
                <div className="data-label">Wrist Angle</div>
                <div className="data-value purple">15° flex</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FEATURES ════ */}
      <section className="features" id="features">
        <div className="container">
          <div className="features-header">
            <p className="pixel-heading">✦ Core Features</p>
            <h2 className="section-title">Everything You Need for <span className="glow-text">Smart Rehab</span></h2>
            <p className="section-subtitle">From real-time sensor tracking to gamified exercises, NeuroKinetics delivers a complete rehabilitation platform.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '📡', color: 'cyan', title: 'Real-Time Monitoring', desc: 'Track finger bending, wrist rotation, and grip strength at 20Hz with sub-degree accuracy.' },
              { icon: '🎮', color: 'purple', title: 'Gamified Exercises', desc: '4 progressive levels with 20 exercises. Earn XP, unlock new challenges, and track your streaks.' },
              { icon: '📊', color: 'green', title: 'Progress Analytics', desc: 'Per-finger ROM charts, session history, peak angle tracking, and weekly trend analysis.' },
              { icon: '🩺', color: 'pink', title: 'Tele-Rehabilitation', desc: 'Physiotherapists can monitor patients remotely, adjust targets, and add clinical notes.' },
              { icon: '❤️', color: 'red', title: 'Vital Monitoring', desc: 'Integrated heart rate and SpO₂ tracking with automatic alerts for abnormal readings.' },
              { icon: '📱', color: 'amber', title: 'IoT Connected', desc: 'ESP32 + BLE 5.0 for seamless wireless data transmission from glove to dashboard.' },
            ].map((f, i) => (
              <div className="card feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ LEVEL MAP ════ */}
      <section className="levels" id="levels">
        <div className="container">
          <div className="levels-header">
            <p className="pixel-heading">🗺️ Exercise Map</p>
            <h2 className="section-title">Level Up Your <span className="glow-text">Recovery</span></h2>
            <p className="section-subtitle">Progress through 4 levels of rehabilitation exercises, unlocking new challenges as you improve.</p>
          </div>
          <div className="level-track">
            {[
              { level: 1, title: 'Basic Extension', desc: 'Fundamental finger extension and flexion exercises. Build foundational range of motion.', color: 'level-1', exercises: ['Finger Spread', 'Basic Curl', 'Thumb Touch', 'Open/Close', 'Hold & Release'] },
              { level: 2, title: 'Targeted Movement', desc: 'Individual finger control and precision movements. Develop fine motor skills.', color: 'level-2', exercises: ['Pinch Grip', 'Finger Walk', 'Key Pinch', 'Tip Press', 'Sequential Tap'] },
              { level: 3, title: 'Strength Building', desc: 'Resistance exercises with servo-assisted training. Build grip strength and endurance.', color: 'level-3', exercises: ['Power Grip', 'Wrist Curl', 'Squeeze Hold', 'Resistance Flex', 'Sustained Grip'] },
              { level: 4, title: 'Compound Movements', desc: 'Complex multi-finger coordination and real-world task simulation.', color: 'level-4', exercises: ['Object Pickup', 'Writing Sim', 'Button Press', 'Twist & Turn', 'Full Dexterity'] },
            ].map((l, i) => (
              <div className="level-node" key={i}>
                <div className={`level-dot ${l.color}`}>LV{l.level}</div>
                <div className="level-info">
                  <h3>{l.title}</h3>
                  <p>{l.desc}</p>
                  <div className="level-exercises">
                    {l.exercises.map((e, j) => (
                      <span className="exercise-tag" key={j}>{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section className="how-it-works" id="how">
        <div className="container">
          <div className="how-header">
            <p className="pixel-heading">⚙️ How It Works</p>
            <h2 className="section-title">From Glove to <span className="glow-text">Recovery</span></h2>
            <p className="section-subtitle">A seamless pipeline from physical sensors to actionable rehabilitation insights.</p>
          </div>
          <div className="how-steps">
            {[
              { num: '01', icon: '🧤', title: 'Wear the Glove', desc: 'Put on the sensor-equipped glove with 5 flex sensors and an IMU.' },
              { num: '02', icon: '📡', title: 'Calibrate', desc: 'Quick 4-second calibration — fully open, then fist — customized to your hand.' },
              { num: '03', icon: '🎮', title: 'Do Exercises', desc: 'Follow guided exercises with real-time visual feedback on your dashboard.' },
              { num: '04', icon: '📈', title: 'Track Progress', desc: 'Review analytics, earn XP, and share results with your therapist remotely.' },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ DASHBOARD PREVIEW ════ */}
      <section className="dashboard-preview" id="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <p className="pixel-heading">🖥️ Live Dashboard</p>
            <h2 className="section-title">Your Rehab <span className="glow-text">Command Center</span></h2>
            <p className="section-subtitle">Real-time visualization of every sensor reading, exercise score, and recovery milestone.</p>
          </div>
          <div className="dashboard-mockup">
            <div className="mockup-topbar">
              <div className="mockup-user">
                <div className="mockup-avatar">👤</div>
                <div>
                  <div className="mockup-name">Patient #2847</div>
                  <div className="mockup-role">Level 2 • Session #14</div>
                </div>
              </div>
              <div className="mockup-stats-row">
                <span className="mockup-stat-chip xp">⚡ 2,450 XP</span>
                <span className="mockup-stat-chip streak">🔥 7-day streak</span>
                <span className="mockup-stat-chip level">🎮 Level 2</span>
              </div>
            </div>
            <div className="mockup-grid">
              {/* Finger Angles Panel */}
              <div className="mockup-panel">
                <div className="mockup-panel-title">Live Finger Angles</div>
                <div className="mini-hand-grid">
                  {[
                    { name: 'Thumb', angle: 68, status: 'green' },
                    { name: 'Index', angle: 72, status: 'green' },
                    { name: 'Middle', angle: 45, status: 'amber' },
                    { name: 'Ring', angle: 58, status: 'green' },
                    { name: 'Pinky', angle: 32, status: 'red' },
                  ].map((f, i) => (
                    <div className={`finger-bar ${f.status}`} key={i}>
                      <div className="finger-name">{f.name}</div>
                      {f.angle}°
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals Panel */}
              <div className="mockup-panel">
                <div className="mockup-panel-title">Vital Signs</div>
                <div className="vitals-row">
                  <div className="vital-item">
                    <div className="vital-icon">❤️</div>
                    <div className="vital-val" style={{ color: 'var(--accent-green)' }}>78</div>
                    <div className="vital-label">BPM</div>
                  </div>
                  <div className="vital-item">
                    <div className="vital-icon">🫁</div>
                    <div className="vital-val" style={{ color: 'var(--accent-cyan)' }}>98%</div>
                    <div className="vital-label">SpO₂</div>
                  </div>
                  <div className="vital-item">
                    <div className="vital-icon">🌡️</div>
                    <div className="vital-val" style={{ color: 'var(--accent-amber)' }}>36.5°</div>
                    <div className="vital-label">Temp</div>
                  </div>
                </div>
              </div>

              {/* Session History Chart */}
              <div className="mockup-panel">
                <div className="mockup-panel-title">Weekly ROM Progress</div>
                <div className="chart-bars">
                  {[40, 55, 52, 65, 70, 68, 78].map((h, i) => (
                    <div
                      key={i}
                      className="chart-bar"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, rgba(0,240,255,0.3), rgba(0,212,170,${0.4 + h / 200}))`,
                        border: '1px solid rgba(0,240,255,0.2)',
                        borderBottom: 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Score Panel */}
              <div className="mockup-panel">
                <div className="mockup-panel-title">Session Score</div>
                <div className="score-display">
                  <div className="score-circle">
                    <div className="score-value">82%</div>
                    <div className="score-label">Score</div>
                  </div>
                  <div className="score-message">🎉 Great session! Full XP earned.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="cta">
        <div className="container cta-content">
          <p className="pixel-heading">🚀 Ready to Begin?</p>
          <h2>Start Your <span className="glow-text">Recovery Journey</span></h2>
          <p>Join NeuroKinetics and experience the future of hand rehabilitation — data-driven, gamified, and accessible from anywhere.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary">Get Started Free →</button>
            <button className="btn btn-secondary">Contact a Therapist</button>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="logo-text" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.65rem' }}>⚡ NeuroKinetics</span>
              <p>IoT-enabled smart hand rehabilitation glove with real-time kinematic analysis for effective hand motor recovery.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#levels">Exercises</a></li>
                <li><a href="#dashboard">Dashboard</a></li>
                <li><a href="#how">How It Works</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Research Papers</a></li>
                <li><a href="#">Hardware Guide</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <ul>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Support</a></li>
                <li><a href="#">About</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 NeuroKinetics. Built with ❤️ for rehabilitation.</p>
            <div className="footer-socials">
              <a href="#" title="GitHub">GH</a>
              <a href="#" title="Twitter">𝕏</a>
              <a href="#" title="LinkedIn">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
