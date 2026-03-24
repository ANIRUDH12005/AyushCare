import React, { useState, useEffect } from 'react';
import './NotificationDropdown.css';
import { 
  FaBell, 
  FaTimes, 
  FaCalendarTimes, 
  FaUserPlus, 
  FaCalendarAlt, 
  FaUserCheck, 
  FaSyringe, 
  FaCommentAlt,
  FaCalendarDay,
  FaExclamationCircle
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Check if user is doctor or therapist based on current path
  const isDoctor = location.pathname.includes('/doctor');
  const userRole = isDoctor ? 'doctor' : 'therapist';

  // Mock notifications based on user role
  useEffect(() => {
    let roleNotifications;
    
    if (userRole === 'doctor') {
      roleNotifications = [
        {
          id: 1,
          type: 'appointment_canceled',
          title: 'Appointment Canceled',
          message: 'Patient Rajesh Kumar canceled his 3 PM appointment',
          time: '10 minutes ago',
          unread: true,
          icon: <FaCalendarTimes />,
          color: '#FF6B6B'
        },
        {
          id: 2,
          type: 'new_patient',
          title: 'New Patient Registered',
          message: 'Priya Sharma has been assigned to you',
          time: '2 hours ago',
          unread: true,
          icon: <FaUserPlus />,
          color: '#4ECDC4'
        },
        {
          id: 3,
          type: 'appointment_rescheduled',
          title: 'Appointment Rescheduled',
          message: 'Anil Verma rescheduled from 4 PM to 5 PM',
          time: '1 day ago',
          unread: false,
          icon: <FaCalendarAlt />,
          color: '#FFD93D'
        },
        {
          id: 4,
          type: 'milestone',
          title: 'Milestone Achieved!',
          message: 'You have attended 100 patients this month',
          time: '2 days ago',
          unread: true,
          icon: <FaUserCheck />,
          color: '#6BCF7F'
        }
      ];
    } else {
      roleNotifications = [
        {
          id: 1,
          type: 'today_therapies',
          title: 'Therapies Today',
          message: 'You have 3 Panchakarma therapies scheduled today',
          time: 'Today, 9:00 AM',
          unread: true,
          icon: <FaSyringe />,
          color: '#4ECDC4'
        },
        {
          id: 2,
          type: 'positive_feedback',
          title: 'Positive Feedback',
          message: 'Patient gave excellent feedback for Basti therapy',
          time: 'Yesterday',
          unread: true,
          icon: <FaCommentAlt />,
          color: '#6BCF7F'
        },
        {
          id: 3,
          type: 'therapy_rescheduled',
          title: 'Therapy Rescheduled',
          message: 'Next therapy session moved from 2 PM to 4 PM',
          time: '2 days ago',
          unread: false,
          icon: <FaExclamationCircle />,
          color: '#FFD93D'
        }
      ];
    }
    
    setNotifications(roleNotifications);
    
    // Count unread notifications
    const unread = roleNotifications.filter(n => n.unread).length;
    setUnreadCount(unread);
  }, [userRole]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, unread: false } : notification
    ));
    // Update unread count
    const updatedUnread = notifications.filter(n => n.id !== id ? n.unread : false).length;
    setUnreadCount(updatedUnread);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, unread: false })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="notification-container">
      <button className="notification-bell" onClick={toggleDropdown}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for outside clicks */}
          <div className="notification-backdrop" onClick={() => setIsOpen(false)} />
          
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {notifications.length > 0 && (
                  <>
                    <button onClick={markAllAsRead} className="notification-action-btn">
                      Mark all as read
                    </button>
                    <button onClick={clearAll} className="notification-action-btn">
                      Clear all
                    </button>
                  </>
                )}
                <button onClick={toggleDropdown} className="notification-close">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon" style={{ backgroundColor: notification.color }}>
                      {notification.icon}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    {notification.unread && <div className="unread-dot"></div>}
                  </div>
                ))
              ) : (
                <div className="notification-empty">
                  No notifications
                </div>
              )}
            </div>

            <div className="notification-footer">
              <button className="view-all-btn">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;