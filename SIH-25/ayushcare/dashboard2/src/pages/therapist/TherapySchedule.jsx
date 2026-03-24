import React, { useState, useEffect } from "react";
import PatientCard from "../../components/Cards/PatientCard";
import { useAuth } from "../../context/AuthContext";
import "./TherapistPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TherapySchedule = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/therapist/appointments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = result.appointments.filter(apt => apt.date === today);
        setAppointments(todayAppts);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <h2 className="page-title">Today&apos;s Therapy Schedule</h2>

      {loading ? (
        <div className="loading">Loading schedule...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments scheduled for today</p>
        </div>
      ) : (
        <div className="grid-3">
          {appointments.map((item) => (
            <PatientCard
              key={item.id}
              name={item.patient}
              therapy={item.type}
              time={item.time}
              status={item.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapySchedule;
