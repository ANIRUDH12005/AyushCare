import React, { useState } from "react";
import "./Auth.css";
import { apiPost } from "../api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);   // 1 = email, 2 = otp, 3 = reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState("");

  // STEP 1: SEND OTP
  const handleSendOtp = async () => {
    if (!email) return;

    const res = await apiPost("/api/auth/send-reset-otp/", { email });

    if (res.success) {
      setStep(2);
      setMessage("OTP sent to your email!");
    } else {
      setMessage(res.message || "Failed to send OTP.");
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async () => {
    const res = await apiPost("/api/auth/verify-reset-otp/", { email, otp });

    if (res.success) {
      setStep(3);
      setMessage("OTP verified. You can reset your password.");
    } else {
      setMessage("Invalid OTP. Try again.");
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async () => {
    if (newPass !== confirmPass) {
      setMessage("Passwords do not match!");
      return;
    }

    const res = await apiPost("/api/auth/reset-password/", {
      email,
      otp,
      new_password: newPass,
    });

    if (res.success) {
      setMessage("Password successfully updated!");
    } else {
      setMessage("Failed to update password.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        
        {step === 1 && (
          <>
            <h2>Reset Password</h2>
            <p>Enter your email to receive OTP</p>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={handleSendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Verify OTP</h2>
            <p>Enter the OTP sent to your email</p>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Create New Password</h2>

            <input
              type="password"
              placeholder="New Password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />

            <input
              type="password"
              placeholder="Re-enter New Password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />

            <button onClick={handleResetPassword}>Save Password</button>
          </>
        )}

        {message && (
          <p style={{ marginTop: "12px", color: "white", fontSize: "14px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
