import React from "react";
import "./LandingNavbar.css";


export default function LandingNavbar() {
  return (
    <nav className="landing-navbar">
      <h2 className="logo">AyushCare</h2>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/signup">Signup</a>
        <a href="/login" className="login-btn">Login</a>
      </div>
    </nav>
  );
}
