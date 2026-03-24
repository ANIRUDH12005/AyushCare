import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiPost } from "../api";
import "./Auth.css";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from Signup.jsx
  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Missing email. Please signup again.");
      navigate("/signup");
      return;
    }

    const res = await apiPost("/api/auth/verify-otp/", {
      email,
      otp,
    });

    console.log("Verify OTP Response:", res);

    if (res.success) {
      alert("Registration Successful!");
      
      // Save tokens and role
      if (res.access) {
        localStorage.setItem("token", res.access);
      }
      if (res.refresh) {
        localStorage.setItem("refresh_token", res.refresh);
      }
      if (res.role) {
        localStorage.setItem("role", res.role);
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      alert(res.message || "Invalid OTP or verification failed.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Verify OTP</h2>
        <p>
          Enter the OTP sent to <strong>{email}</strong>
        </p>

        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            required
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit">Verify OTP</button>
        </form>

        <p style={{ marginTop: "20px" }}>
          Wrong email? <a href="/signup">Signup again</a>
        </p>
      </div>
    </div>
  );
}
