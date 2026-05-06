import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ProfileWidget.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

type UserProfile = {
  full_name: string;
  role: 'patient' | 'therapist';
  xp_total: number;
  level: number;
  streak_days: number;
};

const ProfileWidget: React.FC = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfile(null);
      return;
    }

    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => (response.ok ? response.json() : null))
      .then(data => setProfile(data))
      .catch(() => setProfile(null));
  }, [location.pathname]);

  const progress = useMemo(() => {
    if (!profile) return 82;
    return Math.min(100, Math.round(((profile.xp_total % 500) / 500) * 100));
  }, [profile]);

  const displayName = profile?.full_name ?? 'NeuroKinetics';
  const isTherapist = profile?.role === 'therapist';
  const level = profile?.level ?? 12;
  const xpTotal = profile?.xp_total ?? 2450;
  const nextLevelXp = Math.ceil((xpTotal + 1) / 500) * 500;

  return (
    <div className="profile-widget cursor-target">
      <div className="profile-header">
        <div className="avatar-container">
          <div className="avatar-placeholder">{isTherapist ? '🩺' : '🤖'}</div>
          <div className="level-badge">Lv. {level}</div>
        </div>
        <div className="profile-info">
          <h3 className="profile-name">{displayName}</h3>
          <p className="profile-rank">{isTherapist ? 'Therapist Console' : 'Recovery Profile'}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-label">{isTherapist ? '🧑‍⚕️ Role' : '🔥 Streak'}</span>
          <span className="stat-value">{isTherapist ? 'Therapist' : `${profile?.streak_days ?? 7} Days`}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{isTherapist ? '📋 View' : '🏆 XP'}</span>
          <span className="stat-value">{isTherapist ? 'Patients' : xpTotal}</span>
        </div>
      </div>

      <div className="xp-section">
        <div className="xp-header">
          <span>{isTherapist ? 'Workspace' : 'XP Progress'}</span>
          <span>{isTherapist ? 'Active' : `${xpTotal} / ${nextLevelXp}`}</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar-fill" style={{ width: `${isTherapist ? 100 : progress}%` }}></div>
        </div>
      </div>

      <div className="badges-section">
        <p className="section-label">{isTherapist ? 'Tools' : 'Recent Achievements'}</p>
        <div className="badges-grid">
          <div className="badge-icon" title={isTherapist ? 'Patients' : 'First Stretch'}>{isTherapist ? '👥' : '🧘'}</div>
          <div className="badge-icon" title={isTherapist ? 'Notes' : '7 Day Streak'}>{isTherapist ? '📝' : '🔥'}</div>
          <div className="badge-icon" title={isTherapist ? 'Progress' : '90° Range'}>{isTherapist ? '📈' : '🎯'}</div>
          <div className="badge-icon" title={isTherapist ? 'Care Plan' : 'Perfect Score'}>{isTherapist ? '🧭' : '💎'}</div>
        </div>
      </div>

      <button className="view-profile-btn cursor-target">{isTherapist ? 'Open Patient View' : 'View Full Stats'}</button>
    </div>
  );
};

export default ProfileWidget;
