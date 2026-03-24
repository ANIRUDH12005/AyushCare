import React from 'react';
import './Sidebar.css';
import {
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaSignOutAlt,
  FaCog,
  FaCalendarCheck,
  FaUserFriends,
  FaFileMedical,
  FaChartBar // ADD THIS ICON
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDoctor } = useAuth();
  const currentPath = location.pathname;

  // Define icons based on user role
  const menuItems = isDoctor ? [
    { path: '/doctor', icon: FaHome, label: 'Dashboard' },
    { path: '/doctor/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/doctor/patients', icon: FaUserInjured, label: 'Patients' },
    { path: '/doctor/tracker', icon: FaChartBar, label: 'Tracker' }, // ADD THIS LINE
  ] : [
    { path: '/therapist', icon: FaHome, label: 'Dashboard' },
    { path: '/therapist/schedule', icon: FaCalendarCheck, label: 'Schedule' },
    { path: '/therapist/patients', icon: FaUserFriends, label: 'Patients' },
    { path: '/therapist/docs', icon: FaFileMedical, label: 'Procedures' },
  ];

  const bottomItems = [
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/doctor');
  };

  const userInitial = isDoctor ? 'D' : 'T';

  return (
    <div className="sidebar-root">
      <div className="sidebar-inner">
        <div className="sidebar-dots">
          <div className="dot dot-red"></div>
          <div className="dot dot-yellow"></div>
          <div className="dot dot-green"></div>
        </div>

        <div className="sidebar-items">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.label}
            >
              <item.icon />
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          {bottomItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${currentPath.includes(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.label}
            >
              <item.icon />
            </button>
          ))}
          
          <button
            className="sidebar-item"
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
          
          <div className="sidebar-avatar" title={`${isDoctor ? 'Doctor' : 'Therapist'} Profile`}>
            {userInitial}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;