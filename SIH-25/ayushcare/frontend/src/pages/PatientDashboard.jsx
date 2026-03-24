import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import Carousel from "../components/Carousel";
import CardsSection from "../components/CardsSection";
import CentresCarousel from "../components/CentresCarousel";
import ContactSection from "../components/ContactSection";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import hero4 from "../assets/hero4.jpg";

export default function PatientDashboard({ user }) {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const res = await apiGet("/api/clinic/assignments/");
    if (res && res.success) {
      setAssignments(res.data.filter(a => a.status === "pending_consent"));
    }
  };

  const handleConsent = async (id, action) => {
    const res = await apiPost(`/api/clinic/assignments/${id}/consent/`, { action });
    if (res.success) {
      alert(`Assignment ${action}ed!`);
      fetchAssignments();
    }
  };

  const heroImages = [hero1, hero2, hero3, hero4];
  const centresImages = [
    "https://images.unsplash.com/photo-1543352634-7f0e965e3a57?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4ad1932f9d6c93f7a3f3db7a2db7b4c3",
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=aaac4d6a3c1f9cdfb2a4fef2df7a8c4e",
    "https://images.unsplash.com/photo-1540199542-3a6a80450f70?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=5d7626a9fef3bc8f6eaf72e7f6f7f5a1"
  ];

  const userName = user?.name || "User";

  return (
    <div className="patient-dashboard">
      {assignments.length > 0 && (
        <div className="consent-alert-bar">
          {assignments.map(a => (
            <div key={a.id} className="consent-card">
              <p>Dr. {a.doctor_name} wants to assign therapist <strong>{a.therapist_name}</strong> to you.</p>
              <div className="consent-btns">
                <button className="approve-btn" onClick={() => handleConsent(a.id, "approve")}>Accept</button>
                <button className="decline-btn" onClick={() => handleConsent(a.id, "decline")}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <main className="container">
        <div className="hero-greeting-fixed">
          <h1>Hello, {userName} 👋</h1>
          <h2>Let’s Start Your Panchakarma Therapy</h2>
          <button
            className="hero-btn"
            onClick={() => (window.location.href = "/centers")}
          >
            Book Your Consultation
          </button>
        </div>
        <div className="hero-wrapper">
          <Carousel images={heroImages} />
        </div>
      </main>

      <section className="description-section">
        <h2>Discover the Healing Power of Panchakarma</h2>
        <p className="muted">
          Panchakarma is an ancient Ayurvedic detoxification therapy designed to remove toxins,
          balance the doshas, and restore wellbeing.
        </p>
      </section>

      <section>
        <h2 className="section-title">Our Wellness Offerings</h2>
        <CardsSection />
      </section>

      <section>
        <h2 className="section-title">Our Centres Across India</h2>
        <CentresCarousel images={centresImages} />
      </section>

      <section className="why-section">
        <h2>Why Choose Panchakarma?</h2>
        <p>
          Rooted in ancient Ayurvedic wisdom, Panchakarma restores balance, detoxifies the body,
          and enhances emotional & physical wellbeing.
        </p>
        <div className="why-6-grid">
          <div className="why-6-card">
            <h3>🌿 Natural Detox</h3>
            <p>Flushes deep-rooted toxins and rejuvenates your body.</p>
          </div>
          <div className="why-6-card">
            <h3>🧘 Mind-Body Balance</h3>
            <p>Helps stabilize doshas for emotional clarity and peace.</p>
          </div>
          <div className="why-6-card">
            <h3>💆 Holistic Healing</h3>
            <p>Combines therapies, diet, yoga, and lifestyle treatments.</p>
          </div>
          <div className="why-6-card">
            <h3>5000+</h3>
            <p>Successful Therapies</p>
          </div>
          <div className="why-6-card">
            <h3>50+</h3>
            <p>Panchakarma Centres</p>
          </div>
          <div className="why-6-card">
            <h3>20 Years</h3>
            <p>Ayurveda Experience</p>
          </div>
        </div>
      </section>

      <section className="contact-wrapper">
        <ContactSection />
      </section>
    </div>
  );
}
