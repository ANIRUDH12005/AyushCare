import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./DoctorPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TherapistDetails = () => {
  const { token } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists();
  }, [token]);

  const fetchTherapists = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/doctor/therapists/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setTherapists(result.therapists || []);
      }
    } catch (error) {
      console.error("Error fetching therapists:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <h2 className="page-title">Therapist Details</h2>
      <p className="page-subtitle">View therapist expertise and availability to assign to therapy plans</p>

      {loading ? (
        <div className="loading">Loading therapists...</div>
      ) : therapists.length === 0 ? (
        <div className="empty-state">
          <p>No therapists found</p>
        </div>
      ) : (
        <div className="therapists-grid">
          {therapists.map((therapist) => (
            <div key={therapist.id} className="therapist-card">
              <div className="therapist-header">
                <h3>{therapist.name}</h3>
                <span className={`availability-badge ${therapist.availability}`}>
                  {therapist.availability === "present" ? "Available" : "Unavailable"}
                </span>
              </div>
              
              <div className="therapist-details">
                <div className="detail-row">
                  <span className="detail-label">Specialty:</span>
                  <span className="detail-value">{therapist.specialty || "General"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{therapist.experience_years} years</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Center:</span>
                  <span className="detail-value">{therapist.center || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Today's Workload:</span>
                  <span className="detail-value">{therapist.workload} appointments</span>
                </div>
              </div>

              <div className="therapist-actions">
                <button className="btn-primary">View Details</button>
                <button className="btn-secondary">Assign to Plan</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistDetails;

