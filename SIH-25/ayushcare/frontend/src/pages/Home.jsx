import React from "react";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import TherapistDashboard from "./TherapistDashboard";
import { useApp } from "../context/AppContext";
import "./Home.css";

export default function Home() {
  const { user, role, loading } = useApp();

  if (loading) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  // Render role-specific dashboard
  switch (role) {
    case "DOCTOR":
      return <DoctorDashboard user={user} />;
    case "THERAPIST":
      return <TherapistDashboard user={user} />;
    default:
      return <PatientDashboard user={user} />;
  }
}
