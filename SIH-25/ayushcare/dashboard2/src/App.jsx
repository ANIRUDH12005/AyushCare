import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MenuProvider } from "./context/MenuContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Appointments from "./pages/doctor/Appointments";
import Patients from "./pages/doctor/Patients";
import Tracker from "./pages/doctor/Tracker"; 

import TherapistDashboard from "./pages/therapist/TherapistDashboard";
import TherapySchedule from "./pages/therapist/TherapySchedule";
import AssignedPatients from "./pages/therapist/AssignedPatients";
import ProcedureDocs from "./pages/therapist/ProcedureDocs";

import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Doctor routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <DoctorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <Appointments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <Patients />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/therapists"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <TherapistDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Therapist routes */}
      <Route
        path="/therapist"
        element={
          <ProtectedRoute requiredRole="therapist">
            <DashboardLayout>
              <TherapistDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/schedule"
        element={
          <ProtectedRoute requiredRole="therapist">
            <DashboardLayout>
              <TherapySchedule />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/patients"
        element={
          <ProtectedRoute requiredRole="therapist">
            <DashboardLayout>
              <AssignedPatients />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/docs"
        element={
          <ProtectedRoute requiredRole="therapist">
            <DashboardLayout>
              <ProcedureDocs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <Router>
          <Routes>
            {/* Doctor routes */}
            <Route
              path="/doctor"
              element={
                <DashboardLayout>
                  <DoctorDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <DashboardLayout>
                  <Appointments />
                </DashboardLayout>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <DashboardLayout>
                  <Patients />
                </DashboardLayout>
              }
            />
            <Route
              path="/doctor/tracker"
              element={
                <DashboardLayout>
                  <Tracker />
                </DashboardLayout>
              }
            />

            {/* Therapist routes */}
            <Route
              path="/therapist"
              element={
                <DashboardLayout>
                  <TherapistDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/therapist/schedule"
              element={
                <DashboardLayout>
                  <TherapySchedule />
                </DashboardLayout>
              }
            />
            <Route
              path="/therapist/patients"
              element={
                <DashboardLayout>
                  <AssignedPatients />
                </DashboardLayout>
              }
            />
            <Route
              path="/therapist/docs"
              element={
                <DashboardLayout>
                  <ProcedureDocs />
                </DashboardLayout>
              }
            />

            {/* Default */}
            <Route path="/" element={<Navigate to="/doctor" replace />} />
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </Router>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;