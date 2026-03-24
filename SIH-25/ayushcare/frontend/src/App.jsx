import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import BillingInvoices from "./pages/BillingInvoice.jsx";
import PatientHistory from "./pages/PatientHistory.jsx";
import UserProfile from "./pages/Userprofile.jsx";
import Layout from "./components/Layout.jsx";
import Schedulepage from "./pages/Schedulepage.jsx";
import Notifications from "./pages/Notifications.jsx";
import LandingPage from "./pages/Landing.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";

import ForgotPassword from "./pages/ForgotPassword.jsx";

import ProgressTracking from "./pages/Progresstracking.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Settings from "./pages/Settings.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentFailed from "./pages/PaymentFailed.jsx";

// import Centers from "./pages/Centers";
import CenterDetail from "./pages/CenterDetail";

import Feedback from "./pages/feed.jsx";
import PanchakarmaCenters from "./pages/PanchakarmaCenters.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <div className="app-root">
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />

          {/* Public routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

          {/* Must be PUBLIC */}
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* <Route path="/centers" element={<Centers/>} />
          <Route path="/centers/:id" element={<CenterDetail/>} /> */}

          {/* Protected dashboard */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/billing" element={<BillingInvoices />} />
            <Route path="/patienthistory" element={<PatientHistory />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/schedule" element={<Schedulepage />} />
            {/* other sidebar pages later */}
            <Route path="/centers/:id" element={<CenterDetail />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/centers" element={<PanchakarmaCenters />} />

          </Route>
        </Routes>

        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;