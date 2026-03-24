import React, { useState, useEffect } from "react";
import "./Signup.css";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import { auth } from "../components/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Prepare invisible recaptcha for phone auth
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  }, []);

  const verifyPhoneWithFirebase = async () => {
    try {
      const formatted = phone.startsWith("+") ? phone : `+91${phone}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formatted,
        window.recaptchaVerifier
      );
      const otp = window.prompt("Enter the OTP sent to your phone:");
      if (!otp) throw new Error("OTP entry cancelled");
      await confirmationResult.confirm(otp);
      setPhoneVerified(true);
      return true;
    } catch (err) {
      console.error("Phone verification failed", err);
      alert("Phone verification failed. Please try again.");
      return false;
    }
  };

  // Trigger popup instead of sending OTP directly
  const handleSendOtpClick = async () => {
    // Basic validation
    if (!username.trim() || !email.trim() || !phone.trim() || !password || !role) {
      return alert("Please fill all fields before sending OTP.");
    }
    setShowPopup(true);
  };

  // Send OTP API (email or phone)
  const sendOtp = async (method) => {
    setShowPopup(false);

    const res = await apiPost("/api/auth/signup/", {
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      password,
      role,
      send_to: method, // "email" or "phone"
    });

    if (res.success) {
      setTimer(60);
      alert(`OTP sent to your ${method}`);
      navigate("/verify-otp", { state: { email, phone, role } });
    } else {
      alert(res.message || "Error sending OTP");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert("OTP Verification is on next page.");
  };

  return (
    <div className="auth-container">
      <div className="signup-box">
        <div className="role-selection">
          <p>Register as:</p>
          <div className="role-buttons">
            <button 
              type="button" 
              className={role === "PATIENT" ? "active" : ""} 
              onClick={() => setRole("PATIENT")}
            >
              Patient
            </button>
            <button 
              type="button" 
              className={role === "DOCTOR" ? "active" : ""} 
              onClick={() => setRole("DOCTOR")}
            >
              Doctor
            </button>
            <button 
              type="button" 
              className={role === "THERAPIST" ? "active" : ""} 
              onClick={() => setRole("THERAPIST")}
            >
              Therapist
            </button>
          </div>
        </div>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Phone Number"
            required
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="Create Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="otp-btn"
            onClick={handleSendOtpClick}
            disabled={timer > 0}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Send OTP"}
          </button>

          <button type="submit" className="signup-submit">
            Create Account
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" style={{ display: "none" }} />

      {/* -------- Popup -------- */}
      {showPopup && (
        <div className="otp-popup">
          <div className="popup-content">
            <p>Where do you want to receive OTP?</p>
            <button onClick={() => sendOtp("email")}>Email</button>
            <button onClick={() => sendOtp("phone")}>Phone Number</button>
            <button className="close-btn" onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
