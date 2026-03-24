import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

export default function ContactSection() {
  return (
    <section className="contact-section">
      <h2 className="section-title">Get in Touch With Us</h2>

      <div className="contact-grid">

        {/* Address */}
        <div className="contact-card fixed-card">
          <FaMapMarkerAlt className="contact-icon" />
          <h4>Address</h4>
          <p className="muted center-text">
            123 Ayurveda Lane, <br />
            Wellness City, India
          </p>
        </div>

        {/* Phone */}
        <div className="contact-card fixed-card">
          <FaPhone className="contact-icon" />
          <h4>Phone</h4>
          <p className="muted center-text">+91 98765 43210</p>
        </div>

        {/* Email */}
        <div className="contact-card fixed-card">
          <FaEnvelope className="contact-icon" />
          <h4>Email</h4>
          <p className="muted center-text">contact@panchakarma.example</p>
        </div>

        {/* Social */}
        <div className="contact-card fixed-card">
          <FaEnvelope className="contact-icon" style={{ opacity: 0 }} /> 
          {/* Invisible for alignment */}
          <h4>Follow Us</h4>

          <div className="social-icons social-row">
            <FaFacebook />
            <FaTwitter />
            <FaInstagram />
          </div>
        </div>
      </div>
    </section>
  );
}
