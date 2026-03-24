// ProgressForm.jsx - Form for submitting daily progress
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { apiPost, apiGet } from "../api";
import "./ProgressForm.css";

export default function ProgressForm({ appointmentId, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    appointment_id: appointmentId,
    day_number: 0,
    pain_level: 50,
    sleep_quality: 50,
    stress_level: 50,
    energy_level: 50,
    digestion_quality: 50,
    mood_level: 50,
    notes: "",
    symptoms: [],
    medications_taken: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [nextSubmissionTime, setNextSubmissionTime] = useState(null);

  useEffect(() => {
    checkCanSubmit();
    // Determine day number based on existing entries
    fetchDayNumber();
  }, [appointmentId]);

  const fetchDayNumber = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await apiGet(`/api/progress/my/?appointment_id=${appointmentId}`, token);
      
      if (res && Array.isArray(res)) {
        const maxDay = res.length > 0 
          ? Math.max(...res.map(e => e.day_number || 0))
          : -1;
        setFormData(prev => ({ ...prev, day_number: maxDay + 1 }));
      }
    } catch (error) {
      console.error("Error fetching day number:", error);
    }
  };

  const checkCanSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await apiGet(`/api/progress/can-submit/?appointment_id=${appointmentId}`, token);
      
      if (res && res.success) {
        setCanSubmit(res.can_submit);
        if (res.next_submission_time) {
          setNextSubmissionTime(res.next_submission_time);
        }
      }
    } catch (error) {
      console.error("Error checking submission status:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("level") || name.includes("quality") 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSymptomAdd = () => {
    const symptom = prompt("Enter symptom:");
    if (symptom && symptom.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom.trim()]
      }));
    }
  };

  const handleMedicationAdd = () => {
    const med = prompt("Enter medication:");
    if (med && med.trim()) {
      setFormData(prev => ({
        ...prev,
        medications_taken: [...prev.medications_taken, med.trim()]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) {
      toast.error("Please wait 24 hours before submitting again");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await apiPost("/api/progress/create/", formData, token);
      
      if (res && res.id) {
        toast.success("Progress form submitted! Check your email for confirmation.");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res?.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="progress-form-overlay" onClick={onClose}>
      <div className="progress-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="progress-form-header">
          <h2>Daily Progress Form</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!canSubmit && nextSubmissionTime && (
          <div className="cooldown-notice">
            ⏰ Next submission available: {new Date(nextSubmissionTime).toLocaleString()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="progress-form">
          <div className="form-section">
            <h3>How are you feeling today? (0-100 scale)</h3>
            
            <div className="metric-group">
              <label>
                Pain Level (0=No pain, 100=Severe pain)
                <input
                  type="range"
                  name="pain_level"
                  min="0"
                  max="100"
                  value={formData.pain_level}
                  onChange={handleChange}
                />
                <span className="metric-value">{formData.pain_level}</span>
              </label>
            </div>

            <div className="metric-group">
              <label>
                Sleep Quality (0=Poor, 100=Excellent)
                <input
                  type="range"
                  name="sleep_quality"
                  min="0"
                  max="100"
                  value={formData.sleep_quality}
                  onChange={handleChange}
                />
                <span className="metric-value">{formData.sleep_quality}</span>
              </label>
            </div>

            <div className="metric-group">
              <label>
                Stress Level (0=No stress, 100=Extreme stress)
                <input
                  type="range"
                  name="stress_level"
                  min="0"
                  max="100"
                  value={formData.stress_level}
                  onChange={handleChange}
                />
                <span className="metric-value">{formData.stress_level}</span>
              </label>
            </div>

            <div className="metric-group">
              <label>
                Energy Level (0=No energy, 100=High energy)
                <input
                  type="range"
                  name="energy_level"
                  min="0"
                  max="100"
                  value={formData.energy_level}
                  onChange={handleChange}
                />
                <span className="metric-value">{formData.energy_level}</span>
              </label>
            </div>

            <div className="metric-group">
              <label>
                Digestion Quality (0=Poor, 100=Excellent)
                <input
                  type="range"
                  name="digestion_quality"
                  min="0"
                  max="100"
                  value={formData.digestion_quality}
                  onChange={handleChange}
                />
                <span className="metric-value">{formData.digestion_quality}</span>
              </label>
            </div>

            <div className="metric-group">
              <label>
                Mood Level (0=Very low, 100=Excellent)
                <input
                  type="range"
                  name="mood_level"
                  min="0"
                  max="100"
                  value={formData.mood_level}
                  onChange={handleChange}
                />
                <span className="metric-value">{formData.mood_level}</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <label>
              Additional Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional observations or notes..."
              />
            </label>
          </div>

          <div className="form-section">
            <label>Symptoms</label>
            <div className="list-items">
              {formData.symptoms.map((symptom, idx) => (
                <span key={idx} className="list-item">
                  {symptom}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        symptoms: prev.symptoms.filter((_, i) => i !== idx)
                      }));
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button type="button" onClick={handleSymptomAdd} className="add-btn">
              + Add Symptom
            </button>
          </div>

          <div className="form-section">
            <label>Medications Taken</label>
            <div className="list-items">
              {formData.medications_taken.map((med, idx) => (
                <span key={idx} className="list-item">
                  {med}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        medications_taken: prev.medications_taken.filter((_, i) => i !== idx)
                      }));
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button type="button" onClick={handleMedicationAdd} className="add-btn">
              + Add Medication
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading || !canSubmit} className="submit-btn">
              {loading ? "Submitting..." : "Submit Progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

