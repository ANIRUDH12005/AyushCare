import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";

export default function DoctorDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchTherapists();
  }, []);

  const fetchDashboardData = async () => {
    const res = await apiGet("/api/clinic/doctor/dashboard/");
    if (res && res.success) {
      setStats(res);
    }
  };

  const fetchTherapists = async () => {
    const res = await apiGet("/api/clinic/therapists/list/");
    if (res && res.success) {
      setTherapists(res.data);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedTherapist || !selectedPatient) return;
    
    const res = await apiPost("/api/clinic/assignments/create/", {
      patient_id: selectedPatient.id,
      therapist_id: selectedTherapist,
      notes: "Assigned by " + user.name
    });

    if (res.success) {
      alert("Therapist assigned! Waiting for patient consent.");
      setShowAssignModal(false);
      fetchDashboardData(); // Refresh to show pending assignment
    } else {
      alert(res.message || "Assignment failed");
    }
  };

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <h1>Doctor Dashboard - Welcome, Dr. {user?.name}</h1>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Plans</h3>
          <p className="stat-value">{stats?.active_plans || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Patients Today</h3>
          <p className="stat-value">{stats?.patient_count || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Sessions</h3>
          <p className="stat-value">{stats?.today_appointments?.length || 0}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Today's Appointments</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Therapist</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats?.today_appointments?.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.patient}</td>
                  <td>{apt.time}</td>
                  <td>{apt.type}</td>
                  <td><span className={`status-tag ${apt.status}`}>{apt.status}</span></td>
                  <td>{apt.therapist || "None"}</td>
                  <td>
                    {!apt.therapist && (
                      <button 
                        className="btn-sm btn-primary"
                        onClick={() => {
                          setSelectedPatient({ id: apt.patient_id || 1, name: apt.patient }); // Mocking ID if not provided
                          setShowAssignModal(true);
                        }}
                      >
                        Assign Therapist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Assign Therapist to {selectedPatient?.name}</h3>
            <select 
              value={selectedTherapist} 
              onChange={(e) => setSelectedTherapist(e.target.value)}
            >
              <option value="">Select Therapist</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAssignSubmit}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
