import React from "react";
import "./Notifications.css";
import { FiBell } from "react-icons/fi";
import { FaClipboardCheck, FaCalendarCheck, FaHeartbeat, FaCommentDots } from "react-icons/fa";

const Notifications = () => {
  return (
    <div className="notifications-root">
      <h2 className="noti-title">NOTIFICATIONS</h2>

      <div className="notification-grid">
        
        {/* PRE-PROCEDURE */}
        <div className="noti-box">
          <FaClipboardCheck className="noti-icon" />
          <h3>Pre-Procedure Instructions</h3>
          <p>Know what you need to do before starting your therapy.</p>
          <button className="noti-btn">View Details</button>
        </div>

        {/* TODAY APPOINTMENT */}
        <div className="noti-box">
          <FaCalendarCheck className="noti-icon" />
          <h3>Your Appointment Today</h3>
          <p>Check today’s Panchakarma appointment & timings.</p>
          <button className="noti-btn">View Appointment</button>
        </div>

        {/* POST-PROCEDURE */}
        <div className="noti-box">
          <FaHeartbeat className="noti-icon" />
          <h3>Post-Procedure Care</h3>
          <p>Important steps to follow after therapy for safety.</p>
          <button className="noti-btn">View Instructions</button>
        </div>

        {/* SIDE EFFECT FEEDBACK */}
        <div className="noti-box">
          <FaCommentDots className="noti-icon" />
          <h3>Facing Side Effects?</h3>
          <p>Let us know how you're feeling using our feedback form.</p>
          <button className="noti-btn">Give Feedback</button>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
