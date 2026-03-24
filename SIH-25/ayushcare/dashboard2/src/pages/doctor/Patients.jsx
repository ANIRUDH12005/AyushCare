import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./DoctorPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Patients = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Fetch patients from active treatment plans
    fetchPatients();
  }, [token]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/doctor/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        // Get unique patients from appointments
        const uniquePatients = new Set();
        result.today_appointments?.forEach(apt => {
          uniquePatients.add(apt.patient);
        });
        setPatients(Array.from(uniquePatients));
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (patientName) => {
    // In real implementation, you'd fetch patient ID
    // For now, we'll show a placeholder
    setSelectedPatient(patientName);
  };

  return (
    <div className="page-root">
      <h2 className="page-title">Patient History</h2>

      {loading ? (
        <div className="loading">Loading patient records...</div>
      ) : (
        <div className="patients-container">
          {patients.length === 0 ? (
            <div className="empty-state">
              <p>No patients found. Patients will appear here once they have appointments.</p>
            </div>
          ) : (
            <div className="patients-list">
              {patients.map((patient, index) => (
                <div
                  key={index}
                  className="patient-item"
                  onClick={() => handlePatientClick(patient)}
                >
                  <div className="patient-info">
                    <h3>{patient}</h3>
                    <p>Click to view full history</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedPatient && (
            <div className="patient-details-modal">
              <div className="modal-content">
                <h3>Patient History: {selectedPatient}</h3>
                <p>Full patient history, diagnoses, and treatment plans will be displayed here.</p>
                <button onClick={() => setSelectedPatient(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;
