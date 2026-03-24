import React, { useState, useEffect } from "react";
import AppointmentCard from "../../components/Cards/AppointmentCard";
import { useAuth } from "../../context/AuthContext";
import "./DoctorPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DoctorDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState({
    today_appointments: [],
    active_plans: 0,
    assigned_therapists: [],
    patient_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/doctor/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setData({
          today_appointments: result.today_appointments || [],
          active_plans: result.active_plans || 0,
          assigned_therapists: result.assigned_therapists || [],
          patient_count: result.patient_count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Today's Appointments", value: data.today_appointments.length },
    { label: "Active Patients", value: data.patient_count },
    { label: "Active Therapy Plans", value: data.active_plans },
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

          {data.today_appointments.length > 0 && (
            <section className="section-block">
              <h3 className="section-title">Today's Appointments</h3>
              <div className="appointments-list">
                {data.today_appointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div>
                      <strong>{apt.patient}</strong>
                      {apt.therapist && <span> - Therapist: {apt.therapist}</span>}
                    </div>
                    <div>
                      <span className="time-badge">{apt.time}</span>
                      <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section-block">
            <h3 className="section-title">Quick Notes</h3>
            <p className="section-text">
              Review today&apos;s appointments and prescriptions to ensure a smooth
              Panchakarma experience for your patients.
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
