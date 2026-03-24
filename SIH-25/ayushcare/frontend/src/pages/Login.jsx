// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Auth.css";
import { apiPost, apiGet } from "../api";
import { auth } from "../components/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { setRole: setGlobalRole } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prepare invisible reCAPTCHA once on mount
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  }, []);

  const verifyPhoneWithFirebase = async (phoneNumber) => {
    try {
      const formatted = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formatted,
        appVerifier
      );
      const otp = window.prompt("Enter the OTP sent to your phone:");
      if (!otp) {
        throw new Error("OTP entry cancelled");
      }
      await confirmationResult.confirm(otp);
      return true;
    } catch (err) {
      console.error("Phone verification failed", err);
      toast.error("Phone verification failed. Please try again.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role to login.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const isPhoneLogin = email && !email.includes("@");

      // Optional phone verification (Firebase) when using phone number
      if (isPhoneLogin) {
        const verified = await verifyPhoneWithFirebase(email);
        if (!verified) {
          setLoading(false);
          return;
        }
      }

      // 1) LOGIN
      const res = await apiPost("/api/auth/login/", { email, password, role });

      if (!res || !res.access) {
        setError(res?.message || "Invalid Login Details");
        toast.error(res?.message || "Invalid Login Details");
        setLoading(false);
        return;
      }

      // 2) SAVE TOKEN AND REFRESH TOKEN
      localStorage.setItem("token", res.access);
      if (res.refresh) {
        localStorage.setItem("refresh_token", res.refresh);
      }
      if (res.role) {
        localStorage.setItem("role", res.role);
        setGlobalRole(res.role);
      }
      
      toast.success("Login Successful!");
      navigate("/dashboard");

    } catch (err) {
      console.error("[Login] Error:", err);
      setError("An error occurred during login. Please try again.");
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        <p>Login to continue your journey</p>

        <div className="role-selection">
          <p>Login as:</p>
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

     <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email / Phone No."
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <p 
          className="forgot-text"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>
        
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <div style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
            {error}
          </div>
        )}
      </form>

        <p style={{ marginTop: "20px" }}>
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
      {/* Invisible recaptcha */}
      <div id="recaptcha-container" style={{ display: "none" }} />
    </div>
  );
}
