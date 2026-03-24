import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SchedulePage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProgressForm from "../components/ProgressForm";

export default function SchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const navigate = useNavigate();
  // const [appointments, setAppointments] = useState([]);
  const appointmentDates = appointments.map(a =>
  new Date(a.date).toDateString()
);

useEffect(() => {
  fetchAppointments();
}, []);

// Refetch appointments after cancellation to ensure sync
const fetchAppointments = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/api/appointments/my/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("Fetched appointments:", data);
      
      // Filter out cancelled appointments on frontend
      const activeAppointments = data.filter(apt => apt.status !== "cancelled");
      
      setAppointments(activeAppointments);
      if (activeAppointments.length > 0) {
        setDate(new Date(activeAppointments[0].date));
      }
    } else {
      console.error("Failed to fetch appointments:", res.status, res.statusText);
      const errorData = await res.json().catch(() => ({}));
      console.error("Error data:", errorData);
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};



  // const cancelAppointment = async (id) => {
  //   const token = localStorage.getItem("token");

  //   await axios.post(
  //     `http://127.0.0.1:8000/api/appointments/cancel/${id}/`,
  //     {},
  //     { headers: { Authorization: `Bearer ${token}` } }
  //   );

  //   fetchAppointments();
  // };

  const cancelAppointment = async (id) => {
    const confirm = window.confirm("Cancel this appointment?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:8000/api/appointments/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Remove cancelled appointment from UI immediately
        setAppointments(prev => prev.filter(appt => appt.id !== id));
        alert("Appointment cancelled successfully");
      } else {
        alert(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("An error occurred. Please try again.");
    }
  };


  // const tileClassName = ({ date }) => {
  //   const dateStr = date.toISOString().split("T")[0];
  //   return appointments.some((a) => a.date === dateStr)
  //     ? "highlight-date"
  //     : null;
  // };

  return (
    <div className="schedule-container">
      {/* LEFT */}
      <div className="calendar-container">
        <h3>Appointments</h3>
        <Calendar
  onChange={setDate}
  value={date}
  tileClassName={({ date }) =>
    appointmentDates.includes(date.toDateString())
      ? "highlight-date"
      : null
  }
/>
      </div>

      {/* RIGHT */}
      <div className="slots-section">
        <h2>My Appointments</h2>

        {appointments.length === 0 && <p>No appointments found</p>}

        {appointments.map((apt) => (
          <div className="appointment-card" key={apt.id}>
            <div>
              <h4>{apt.location_name || "Panchakarma Center"}</h4>
              <p>Doctor: {apt.doctor_name || apt.doctor?.name || "Not assigned"}</p>
              <p>
                📅 {apt.date} ⏰ {apt.time}
              </p>
              <p>Status: {apt.status}</p>
            </div>

            <div className="card-actions">
              {apt.status === "completed" && (
                <button
                  className="progress-btn"
                  onClick={() => {
                    setSelectedAppointmentId(apt.id);
                    setShowProgressForm(true);
                  }}
                  style={{
                    background: "#6c63ff",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginRight: "8px"
                  }}
                >
                  📊 Submit Progress
                </button>
              )}
              
              <button
                className="cancel-btn"
                onClick={() => cancelAppointment(apt.id)}
                disabled={apt.status === "completed"}
              >
                Cancel
              </button>

              <button
                className="reschedule-btn"
                onClick={() => navigate("/centers")}
              >
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Form Modal */}
      {showProgressForm && (
        <ProgressForm
          appointmentId={selectedAppointmentId}
          onSuccess={() => {
            setShowProgressForm(false);
            fetchAppointments();
          }}
          onClose={() => setShowProgressForm(false)}
        />
      )}
    </div>
  );
}
