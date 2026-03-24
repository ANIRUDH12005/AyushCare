import React from 'react';
import './Navbar.css';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import NotificationDropdown from '../Notifications/NotificationDropdown';

// ✅ FIXED IMPORT
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isDoctor, isTherapist } = useAuth();
  
  const userName = user?.name || (isDoctor ? 'Dr. Sharma' : 'Therapist Verma');
  const userRole = isDoctor ? 'Senior Ayurveda Doctor' : 'Panchakarma Specialist';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-welcome">
          <h1>Welcome back, {isDoctor ? 'Doctor' : 'Therapist'}</h1>
          <p className="navbar-date">{currentDate} • {currentTime}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <FaSearch className="search-icon" />
          <input 
            type="text"
            placeholder="Search patients, appointments..."
            className="search-input"
          />
        </div>

        <NotificationDropdown />

        <div className="navbar-profile">
          <FaUserCircle className="profile-icon" />
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">{userRole}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
