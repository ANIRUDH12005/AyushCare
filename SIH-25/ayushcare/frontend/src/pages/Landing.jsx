import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const homeRef = useRef(null);
  const galleryRef = useRef(null);
  const aboutRef = useRef(null);
  const workRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-root">

      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="nav-logo">
          <img src="/ayushcare-logo.png" alt="AyushCare Logo" className="logo-img" />
        </div>

        <div className="nav-links">
          <button onClick={() => scrollToSection(homeRef)}>Home</button>
          <button onClick={() => scrollToSection(galleryRef)}>Gallery</button>
          <button onClick={() => scrollToSection(aboutRef)}>About</button>
          <button onClick={() => scrollToSection(workRef)}>Work With Us</button>
        </div>

        <div className="nav-auth">
          <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={homeRef}>
  <h1 className="landing-welcome">Welcome to AyushCare</h1>

  <h2 className="landing-title">
    Experience the Ancient Healing of Panchakarma
  </h2>

  {/* Book Button INSIDE HERO SECTION */}
  <button 
    className="book-btn"
    onClick={() => navigate("/login")}
  >
    Book Your Consultation
  </button>
</section>



      {/* Gallery */}
      <section className="gallery-section" ref={galleryRef}>
        <h2 className="gallery-title">GALLERY</h2>

        <div className="gallery-grid">
          <div className="gallery-card">
            <img src="/Equipment.jpg" alt="Equipments" />
            <p>Panchakarma Equipments</p>
          </div>

          <div className="gallery-card">
            <img src="/gallery3.avif" alt="Therapy Room" />
            <p>Panchakarma Therapy Room</p>
          </div>

          <div className="gallery-card">
            <img src="/treatment1.jpeg" alt="Setup" />
            <p>Ayurvedic Treatment Setup</p>
          </div>

          <div className="gallery-card">
            <img src="/treatment 2.jpg" alt="Procedure" />
            <p>Panchakarma Procedure</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about-section" ref={aboutRef}>
        <h2>About Panchakarma</h2>
        <p>
          Panchakarma is the essence of Ayurvedic healing — a therapeutic detoxification system
          designed to cleanse the body, balance the doshas, and restore natural immunity.
          Herbal therapies, medicated oils, steam treatments, and rejuvenation practices
          help eliminate deep-rooted toxins and revitalize both mind and body.
        </p>
      </section>

      {/* Work With Us */}
      <section className="work-section" ref={workRef}>
        <h2>Work With Us</h2>
        <p>
          Join AyushCare as a wellness partner, clinic or Ayurvedic centre.
          Grow with digital tools for patient engagement, therapy scheduling,
          service promotion, and national-level client visibility.
        </p>
        <button className="join-btn">Become a Partner</button>
      </section>

    </div>
  );
}