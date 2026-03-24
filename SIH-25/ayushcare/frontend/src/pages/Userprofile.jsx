import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./UserProfile.css";

export default function UserProfile() {
  const [personalInfo] = useState({
    fullName: "Anirudh Yadav",
    phone: "+91 98765 43210",
    email: "anirudh@example.com",
    gender: "Male",
    dob: "1998-10-12",
    address: "Bhopal, Madhya Pradesh, India",
  });

  const [medicalInfo] = useState({
    bloodGroup: "B+",
    height: 175,
    weight: 68,
    allergy: "None",
    condition: "Healthy",
    medication: "Ayurvedic",
  });

  const [editing, setEditing] = useState(false);
  const [bmi, setBmi] = useState(0);

  useEffect(() => {
    const h = medicalInfo.height / 100;
    setBmi((medicalInfo.weight / (h * h)).toFixed(1));
  }, [medicalInfo.height, medicalInfo.weight]);

  return (
    <div className="profile-container">
      {/* Background Pattern/Image */}
      <div className="background-overlay"></div>
      
      {/* Main Content */}
      <div className="profile-wrapper">
        {/* LEFT PROFILE CARD - My Profile */}
        <div className="profile-left card-elevated">
          <div className="profile-photo-section">
            <FaUserCircle className="profile-big-photo" />
            <div className="profile-status"></div>
          </div>

          <div className="profile-info-section">
            <h3 className="profile-title">My Profile</h3>
            <div className="profile-name">{personalInfo.fullName}</div>
            
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>{personalInfo.phone}</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>{personalInfo.email}</span>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>{personalInfo.address}</span>
              </div>
            </div>

            <button className="edit-profile-btn" onClick={() => setEditing(!editing)}>
              <FaEdit /> {editing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* RIGHT PROFILE CARDS */}
        <div className="profile-right">
          {/* GENERAL INFORMATION CARD */}
          <div className="general-info-card card-elevated">
            <div className="card-header">
              <h3 className="card-title">General Information</h3>
              <div className="card-divider"></div>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p className="info-value bold">{personalInfo.fullName}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p className="info-value">{personalInfo.phone}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p className="info-value">{personalInfo.email}</p>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <p className="info-value">{personalInfo.gender}</p>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <p className="info-value">{personalInfo.dob}</p>
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                <p className="info-value">{personalInfo.address}</p>
              </div>
            </div>
          </div>

          {/* MEDICAL INFORMATION CARD */}
          <div className="medical-info-card card-elevated">
            <div className="card-header">
              <h3 className="card-title">Medical Information</h3>
              <div className="card-divider"></div>
            </div>
            
            <div className="medical-grid">
              <div className="medical-item">
                <div className="medical-label">Blood Group</div>
                <div className="medical-value highlight">{medicalInfo.bloodGroup}</div>
              </div>
              <div className="medical-item">
                <div className="medical-label">Height</div>
                <div className="medical-value">{medicalInfo.height} cm</div>
              </div>
              <div className="medical-item">
                <div className="medical-label">Weight</div>
                <div className="medical-value">{medicalInfo.weight} kg</div>
              </div>
              <div className="medical-item">
                <div className="medical-label">BMI</div>
                <div className="medical-value">{bmi}</div>
              </div>
              <div className="medical-item">
                <div className="medical-label">Allergy</div>
                <div className="medical-value">{medicalInfo.allergy}</div>
              </div>
              <div className="medical-item">
                <div className="medical-label">Condition</div>
                <div className="medical-value">{medicalInfo.condition}</div>
              </div>
              <div className="medical-item">
                <div className="medical-label">Medication</div>
                <div className="medical-value">{medicalInfo.medication}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}