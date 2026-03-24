import React, { useState, useEffect } from "react";
import AppointmentCard from "../../components/Cards/AppointmentCard";
import { useAuth } from "../../context/AuthContext";
import "./TherapistPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TherapistDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState({
    today_sessions: [],
    pending_sessions: 0,
    completed_sessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/therapist/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setData({
          today_sessions: result.today_sessions || [],
          pending_sessions: result.pending_sessions || 0,
          completed_sessions: result.completed_sessions || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Today's Sessions", value: data.today_sessions.length },
    { label: "Pending Sessions", value: data.pending_sessions },
    { label: "Completed Sessions", value: data.completed_sessions },
  ];

  return (
    <div className="page-root">
      <h2 className="page-title">Overview</h2>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="grid-3">
            {stats.map((item) => (
              <AppointmentCard
                key={item.label}
                title={item.label}
                count={item.value}
                subtitle="Updated today"
              />
            ))}
          </div>

          {data.today_sessions.length > 0 && (
            <section className="section-block">
              <h3 className="section-title">Today's Assigned Sessions</h3>
              <div className="appointments-list">
                {data.today_sessions.map((session) => (
                  <div key={session.id} className="appointment-item">
                    <div>
                      <strong>{session.patient}</strong>
                      {session.doctor && <span> - Doctor: {session.doctor}</span>}
                    </div>
                    <div>
                      <span className="time-badge">{session.time}</span>
                      <span className={`status-badge ${session.status}`}>{session.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section-block">
            <h3 className="section-title">Reminder</h3>
            <p className="section-text">
              Ensure pre- and post-procedure instructions are clearly communicated
              to all patients before and after therapy sessions.
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default TherapistDashboard;
