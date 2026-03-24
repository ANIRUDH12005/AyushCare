import React, { useEffect } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaFileInvoice,
  FaHistory,
  FaClinicMedical,
  FaCommentDots,
  FaHome,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Sidebar.css";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { role } = useApp();

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const allItems = [
    { icon: <FaHome />, text: "Home", path: "/home", roles: ["PATIENT", "DOCTOR", "THERAPIST"] },
    { icon: <FaCalendarAlt />, text: "Schedule", path: "/schedule", roles: ["PATIENT", "DOCTOR", "THERAPIST"] },
    { icon: <FaChartLine />, text: "Progress Tracking", path: "/progress", roles: ["PATIENT"] },
    { icon: <FaFileInvoice />, text: "Billing & Invoices", path: "/billing", roles: ["PATIENT", "DOCTOR"] },
    { icon: <FaHistory />, text: "Patient History", path: "/patienthistory", roles: ["PATIENT", "DOCTOR", "THERAPIST"] },
    { icon: <FaClinicMedical />, text: "Panchakarma Centres", path: "/centers", roles: ["PATIENT", "DOCTOR", "THERAPIST"] },
    { icon: <FaCommentDots />, text: "Feedback", path: "/feedback", roles: ["PATIENT"] },
  ];

  const items = allItems.filter(item => item.roles.includes(role || "PATIENT"));

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* == Profile Header Section == */}
        <div
          className="profile-section"
          onClick={() => {
            navigate("/userprofile");
            setSidebarOpen(false);
          }}
        >
          <FaUserCircle className="sidebar-profile-icon" />
          <h2>MY PROFILE</h2>
          <p>View/edit</p>
        </div>

        {/* Close Button */}
        <button
          className="close-btn"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(false);
          }}
        >
          <FaTimes />
        </button>

        {/* Menu with bar containers */}
        <nav className="sidebar-nav">
          {items.map((it, i) => (
            <div
              key={i}
              className="sidebar-item-container"
              onClick={() => {
                navigate(it.path);
                setSidebarOpen(false);
              }}
            >
              <div className="menu-bar">
                <span className="sidebar-icon">{it.icon}</span>
                <span className="sidebar-text">{it.text}</span>
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
