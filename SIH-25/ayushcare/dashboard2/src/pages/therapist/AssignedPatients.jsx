import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./TherapistPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AssignedPatients = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [token]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/therapist/appointments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        // Get unique patients
        const uniquePatients = new Set();
        result.appointments?.forEach(apt => {
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
    // In real implementation, fetch patient ID and details
    setSelectedPatient(patientName);
  };

  return (
    <div className="page-root">
      <h2 className="page-title">Assigned Patients</h2>
      <p className="page-subtitle">View patient details, therapy plans, and session instructions</p>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <p>No patients assigned yet. Patients will appear here once assigned by the doctor.</p>
        </div>
      ) : (
        <div className="patients-container">
          <div className="patients-list">
            {patients.map((patient, index) => (
              <div
                key={index}
                className="patient-item"
                onClick={() => handlePatientClick(patient)}
              >
                <div className="patient-info">
                  <h3>{patient}</h3>
                  <p>Click to view therapy details and instructions</p>
                </div>
              </div>
            ))}
          </div>

          {selectedPatient && (
            <div className="patient-details-modal">
              <div className="modal-content">
                <h3>Patient Details: {selectedPatient}</h3>
                <p>Therapy plan details, session instructions, and doctor notes will be displayed here.</p>
                <button onClick={() => setSelectedPatient(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignedPatients;
