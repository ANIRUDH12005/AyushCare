import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaHome, FaSearch, FaUserCircle, FaBell, FaChevronDown, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";
import { t } from "../i18n";
import "./Navbar.css";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language, loadUserData } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getPageName = () => {
    const path = location.pathname;
    if (path === "/home" || path === "/") return "Home";
    if (path === "/schedule") return "Schedule";
    if (path === "/progress") return "Progress Tracking";
    if (path === "/billing") return "Billing & Invoices";
    if (path === "/patienthistory") return "Patient History";
    if (path === "/centers") return "Panchakarma Centres";
    if (path === "/feedback") return "Feedback";
    if (path === "/notifications") return "Notifications";
    if (path === "/userprofile") return "My Profile";
    return "Home";
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleProfileClick = () => {
    navigate("/userprofile");
    setDropdownOpen(false);
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSettings = () => {
    navigate("/settings");
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="navbar">
      {/* LEFT: menu / home */}
      <div className="navbar-left">
        {!sidebarOpen ? (
          <button
            className="icon-btn"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars size={20} />
          </button>
        ) : (
          <div className="home-icon">
            <FaHome size={20} />
            <span className="home-text">{getPageName()}</span>
          </div>
        )}
      </div>

      {/* CENTER: removed search bar */}
      <div className="navbar-center">
      </div>

      {/* RIGHT: notification + profile */}
      <div className="navbar-right">
        {/* Notification Bell */}
        <div 
          className="notification-icon"
          onClick={handleNotificationClick}
          title="Notifications"
        >
          <FaBell size={20} />
          <span className="notification-badge">3</span>
        </div>

        {/* Profile with Dropdown */}
        <div className="profile-dropdown" ref={dropdownRef}>
          <div
            className="profile-section"
            onClick={toggleDropdown}
          >
            <div className="account-btn">
              <div className="avatar-circle">
                {false ? (
                  <img src="/user-photo.jpg" alt="User" className="avatar-img" />
                ) : (
                  <FaUserCircle className="default-avatar" />
                )}
              </div>
              <span className="user-name">{user?.name || "User"}</span>
              <FaChevronDown className={`dropdown-arrow ${dropdownOpen ? 'rotate' : ''}`} />
            </div>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfileClick}>
                <FaUser className="dropdown-icon" />
                <span>{t("profile", language)}</span>
              </div>
              <div className="dropdown-item" onClick={handleSettings}>
                <FaCog className="dropdown-icon" />
                <span>{t("settings", language)}</span>
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt className="dropdown-icon" />
                <span>{t("logout", language)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* {showLogoutMenu && (
          <div className="logout-menu">
            <button 
              className="logout-menu-item"
              onClick={() => {
                navigate("/userprofile");
                setShowLogoutMenu(false);
              }}
            >
              <FaUserCircle /> Profile
            </button>
            <button 
              className="logout-menu-item logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )} */}
      </div>
    </header>
  );
}