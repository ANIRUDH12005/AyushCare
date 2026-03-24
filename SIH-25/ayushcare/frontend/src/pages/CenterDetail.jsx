// src/pages/CenterDetail.jsx
import React, { useEffect, useState } from "react";
import { apiGet, getDoctorsByCenter, createAppointment } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./CenterDetail.css";

export default function CenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [center, setCenter] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    loadCenter();
    loadDoctors();
  }, [id]);

  async function loadCenter() {
    const res = await apiGet(`/api/centers/${id}/`, token);
    setCenter(res);
  }

  async function loadDoctors() {
    const res = await getDoctorsByCenter(id, token);
    if (Array.isArray(res)) {
      setDoctors(res);
    } else {
      console.error("Unexpected doctors response:", res);
    }
  }

  const slotToTime = (slot) => {
    if (slot === "10am-2pm") return "10:00:00";
    if (slot === "2pm-6pm") return "14:00:00";
    if (slot === "6pm-10pm") return "18:00:00";
    return "";
  };

  const bookAppointment = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      alert("Select doctor, date and time slot");
      return;
    }

    const payload = {
      doctor_id: selectedDoctorId,   // ✅ FIXED
      center_id: center.id,          // ✅ FIXED
      date: selectedDate,
      time: slotToTime(selectedSlot),
      appointment_type: "consultation",
      location_name: center.name,
      notes: `Booked via ${center.name}`
    };

    console.log("BOOK PAYLOAD:", payload);

    const res = await createAppointment(payload, token);

    if (res && res.success && res.data && res.data.id) {
      alert("Appointment booked successfully! Check your notifications for important information.");
      navigate("/schedule");
    } else {
      console.error("Booking failed:", res);
      alert(res?.error || res?.message || "Failed to book appointment. Please try again.");
    }
  };

  if (!center) return <div style={{ padding: "40px", textAlign: "center" }}>Loading center details...</div>;

  // Get image URLs - prefer image1_url/image2_url from serializer, fallback to direct paths
  const image1Url = center.image1_url || (center.image1 ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${center.image1}` : null);
  const image2Url = center.image2_url || (center.image2 ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${center.image2}` : null);

  return (
    <div className="center-detail-container">
      {/* Hero Section */}
      <div className="center-hero">
        <div className="center-hero-images">
          <img
            src={image1Url || "/placeholder1.jpg"}
            alt={center.name}
            onError={(e) => { e.target.src = "/placeholder1.jpg"; }}
          />
          <img
            src={image2Url || "/placeholder2.jpg"}
            alt={center.name}
            onError={(e) => { e.target.src = "/placeholder2.jpg"; }}
          />
        </div>
        <div className="center-hero-info">
          <h1>{center.name}</h1>
          <p className="location">📍 {center.city}, {center.state} - {center.pincode}</p>
          <p className="address">{center.address}</p>
          <p className="contact">📞 {center.contact_number}</p>
        </div>
      </div>

      <div className="center-detail-content">
        {/* LEFT SIDE - Map */}
        {/* LEFT SIDE - Map REMOVED as per user request */}
        {/* <div className="center-detail-left">...</div> */}

        {/* RIGHT SIDE - Details & Booking */}
        <div className="center-detail-right">
          {center.description && (
            <div className="description-section">
              <h3>About</h3>
              <p>{center.description}</p>
            </div>
          )}

          {center.available_services && (
            <div className="services-section">
              <h3>Available Services</h3>
              <p>{center.available_services}</p>
            </div>
          )}

          <div className="doctors-section">
            <h3>👨‍⚕️ Available Doctors</h3>
            {doctors.length > 0 ? (
              <div className="doctors-list">
                {doctors.map((d) => (
                  <div
                    key={d.id}
                    className={`doctor-card ${selectedDoctorId === d.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDoctorId(d.id)}
                  >
                    <div className="doctor-info">
                      <h4>{d.name}</h4>
                      <p className="specialty">{d.specialty || "General Practitioner"}</p>
                      <p className="timing">⏰ {d.timing || "Flexible"}</p>
                    </div>
                    <button
                      className={selectedDoctorId === d.id ? 'btn-selected' : 'btn-select'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoctorId(d.id);
                      }}
                    >
                      {selectedDoctorId === d.id ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No doctors available at this center.</p>
            )}
          </div>

          <div className="booking-section">
            <h3>📅 Book Appointment</h3>

            {selectedDoctorId ? (
              <div className="selected-doctor-info">
                <p>Selected: <strong>{doctors.find(d => d.id === selectedDoctorId)?.name}</strong></p>
              </div>
            ) : (
              <p className="warning">⚠️ Please select a doctor first</p>
            )}

            <div className="booking-form">
              <div className="form-group">
                <label>Select Date *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Select Time Slot *</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  <option value="">Choose a time slot</option>
                  <option value="10am-2pm">10:00 AM - 02:00 PM</option>
                  <option value="2pm-6pm">02:00 PM - 06:00 PM</option>
                  <option value="6pm-10pm">06:00 PM - 10:00 PM</option>
                </select>
              </div>

              <button
                className="btn-book"
                onClick={bookAppointment}
                disabled={!selectedDoctorId || !selectedDate || !selectedSlot}
              >
                📋 Book Appointment & Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
