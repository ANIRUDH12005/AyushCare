import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";

export default function TherapistDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchTherapistData();
  }, []);

  const fetchTherapistData = async () => {
    const res = await apiGet("/api/clinic/therapist/dashboard/");
    if (res && res.success) {
      setStats(res);
      setSessions(res.today_sessions || []);
    }
  };

  const handleMarkComplete = async (id) => {
    const res = await apiPost(`/api/clinic/therapist/appointments/${id}/complete/`);
    if (res.success) {
      alert("Session completed!");
      fetchTherapistData();
    }
  };

  return (
    <div className="therapist-dashboard">
      <header className="dashboard-header">
        <h1>Therapist Dashboard - Welcome, {user?.name}</h1>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Sessions Today</h3>
          <p className="stat-value">{sessions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Completed</h3>
          <p className="stat-value">{stats?.completed_sessions || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-value">{stats?.pending_sessions || 0}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>My Schedule (Today)</h2>
        <div className="sessions-list">
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <div key={s.id} className="session-item">
                <div className="session-info">
                  <span className="session-time">{s.time}</span>
                  <div className="session-details">
                    <p><strong>Patient:</strong> {s.patient}</p>
                    <p><strong>Doctor:</strong> {s.doctor}</p>
                    <p><strong>Type:</strong> {s.type}</p>
                  </div>
                </div>
                <div className="session-actions">
                  {s.status !== "completed" ? (
                    <button onClick={() => handleMarkComplete(s.id)}>Mark Complete</button>
                  ) : (
                    <span className="completed-tag">Done</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No sessions scheduled for today.</p>
          )}
        </div>
      </section>
    </div>
  );
}
