import React, { useState, useEffect } from "react";
import PatientCard from "../../components/Cards/PatientCard";
import { useAuth } from "../../context/AuthContext";
import "./DoctorPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Appointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/doctor/appointments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAppointments(result.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <h2 className="page-title">Appointments</h2>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="grid-3">
          {appointments.map((appt) => (
            <PatientCard
              key={appt.id}
              name={appt.patient}
              therapy={appt.type}
              time={appt.time}
              status={appt.status}
              therapist={appt.therapist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
