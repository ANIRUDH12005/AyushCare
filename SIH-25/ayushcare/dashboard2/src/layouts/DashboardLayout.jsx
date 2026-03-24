import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-main">
        <Navbar />
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;