import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaUser, FaBell, FaLock, FaSignOutAlt, FaCalendarAlt, 
  FaHeart, FaPalette, FaSave, FaUpload, FaTrash,
  FaTwitter, FaFacebook, FaApple, FaLinkedin, FaGoogle
} from "react-icons/fa";
import { apiGet, apiPut, apiPost } from "../api";
import { useApp } from "../context/AppContext";
import { t } from "../i18n";
import "./Settings.css";

export default function Settings() {
  const token = localStorage.getItem("token");
  const { theme, setTheme, language, setLanguage } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  // Account Information
  const [accountInfo, setAccountInfo] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    gender: "",
  });

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState({
    news: true,
    updates: true,
    userResearch: false,
    reminders: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    reminders: true,
    activity: true,
  });

  // Password Change
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Health Preferences
  const [healthPreferences, setHealthPreferences] = useState({
    medical_conditions: [],
    ayurvedic_body_type: "",
    health_notes: "",
  });

  // UI Preferences
  const [uiPreferences, setUiPreferences] = useState({
    theme: theme || "light",
    time_format: "12",
    language: language || "en",
  });

  // Delete account confirmation
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [centers, setCenters] = useState([]);
  const [newCondition, setNewCondition] = useState("");

  useEffect(() => {
    loadProfile();
    loadSettings();
    loadCenters();
    setTimeout(() => setLoading(false), 500);
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiGet("/api/patient/profile/", token);
      if (res && res.success && res.data) {
        const d = res.data;
        setAccountInfo({
          name: d.full_name || "John Doe",
          email: d.user_email || d.email || "email@example.com",
          phone: d.phone || "",
          dob: d.dob || "9/17/2023",
          address: d.address || "",
          gender: d.gender || "Male",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await apiGet("/api/user/settings/", token);
      if (res && res.success && res.data) {
        const data = res.data;
        
        // Update notifications
        if (data.notifications) {
          setEmailNotifications({
            news: data.notifications.news || true,
            updates: data.notifications.updates || true,
            userResearch: data.notifications.userResearch || false,
            reminders: data.notifications.reminders || true,
          });
          setPushNotifications({
            reminders: data.notifications.pushReminders || true,
            activity: data.notifications.pushActivity || true,
          });
        }

        // Update health preferences
        setHealthPreferences({
          medical_conditions: data.medical_conditions || [],
          ayurvedic_body_type: data.ayurvedic_body_type || "",
          health_notes: data.health_notes || "",
        });

        // Update UI preferences
        const uiPrefs = {
          theme: data.theme || "light",
          time_format: data.time_format || "12",
          language: data.language || "en",
        };
        setUiPreferences(uiPrefs);
        setTheme(uiPrefs.theme);
        setLanguage(uiPrefs.language);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadCenters = async () => {
    try {
      const res = await apiGet("/api/centers/", token);
      if (res && Array.isArray(res)) {
        setCenters(res);
      }
    } catch (error) {
      console.error("Error loading centers:", error);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const res = await apiPut(
        "/api/user/update-profile/",
        {
          name: accountInfo.name,
          email: accountInfo.email,
          phone: accountInfo.phone,
          address: accountInfo.address,
          dob: accountInfo.dob,
          gender: accountInfo.gender,
        },
        token
      );
      if (res && res.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleEmailNotification = (key) => {
    const updated = { ...emailNotifications, [key]: !emailNotifications[key] };
    setEmailNotifications(updated);
    saveNotifications({ email: updated });
  };

  const togglePushNotification = (key) => {
    const updated = { ...pushNotifications, [key]: !pushNotifications[key] };
    setPushNotifications(updated);
    saveNotifications({ push: updated });
  };

  const saveNotifications = async (notifications) => {
    try {
      await apiPut("/api/user/settings/", { notifications }, token);
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  const changePassword = async () => {
    if (password.new_password !== password.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (password.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setSaving(true);
    try {
      const res = await apiPut("/api/user/change-password/", password, token);
      if (res && res.success) {
        toast.success("Password changed successfully!");
        setPassword({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Error changing password");
    } finally {
      setSaving(false);
    }
  };

  const updateHealthPreferences = async () => {
    setSaving(true);
    try {
      const res = await apiPut("/api/user/settings/", { ...healthPreferences }, token);
      if (res && res.success) {
        toast.success("Health preferences updated!");
      } else {
        toast.error(res?.message || "Failed to update health preferences");
      }
    } catch (error) {
      toast.error("Error updating health preferences");
    } finally {
      setSaving(false);
    }
  };

  const updateUiPreferences = async () => {
    setSaving(true);
    try {
      const res = await apiPut("/api/user/settings/", { ...uiPreferences }, token);
      if (res && res.success) {
        toast.success("UI preferences updated!");
        // Update context (which will apply theme)
        setTheme(uiPreferences.theme);
        setLanguage(uiPreferences.language);
      } else {
        toast.error(res?.message || "Failed to update UI preferences");
      }
    } catch (error) {
      toast.error("Error updating UI preferences");
    } finally {
      setSaving(false);
    }
  };

  const addMedicalCondition = () => {
    if (newCondition.trim()) {
      const updated = {
        ...healthPreferences,
        medical_conditions: [...healthPreferences.medical_conditions, newCondition.trim()],
      };
      setHealthPreferences(updated);
      setNewCondition("");
      // Auto-save
      apiPut("/api/user/settings/", { medical_conditions: updated.medical_conditions }, token);
    }
  };

  const removeMedicalCondition = (index) => {
    const updated = {
      ...healthPreferences,
      medical_conditions: healthPreferences.medical_conditions.filter((_, i) => i !== index),
    };
    setHealthPreferences(updated);
    // Auto-save
    apiPut("/api/user/settings/", { medical_conditions: updated.medical_conditions }, token);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      toast.info("Account deletion initiated. This would call the delete API.");
      // In real app: apiPost("/api/delete-account/", { confirm: deleteConfirm }, token)
      setShowDeleteConfirm(false);
      setDeleteConfirm("");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="settings-content">
            <h2 className="section-title">Basic Information</h2>
            <div className="form-section">
              <label className="form-label">Profile photo</label>
              <p className="form-description">This will be displayed on your profile.</p>
              <div className="profile-upload-area">
                <div className="profile-avatar">
                  <FaUser size={48} />
                </div>
                <button className="upload-btn">
                  <FaUpload /> Upload Photo
                </button>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input"
                value={accountInfo.name}
                onChange={(e) => setAccountInfo({...accountInfo, name: e.target.value})}
                placeholder="Full Name"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input"
                value={accountInfo.email}
                onChange={(e) => setAccountInfo({...accountInfo, email: e.target.value})}
                placeholder="Email"
              />
            </div>

            <div className="form-row">
              <div className="form-section">
                <label className="form-label">Gender</label>
                <select 
                  className="form-input"
                  value={accountInfo.gender}
                  onChange={(e) => setAccountInfo({...accountInfo, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-section">
                <label className="form-label">Date of Birth</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={accountInfo.dob}
                  onChange={(e) => setAccountInfo({...accountInfo, dob: e.target.value})}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Phone No.</label>
              <input 
                type="tel" 
                className="form-input"
                value={accountInfo.phone}
                onChange={(e) => setAccountInfo({...accountInfo, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Address</label>
              <textarea 
                className="form-input"
                value={accountInfo.address}
                onChange={(e) => setAccountInfo({...accountInfo, address: e.target.value})}
                placeholder="Enter your full address"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button className="save-btn" onClick={updateProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        );

      case "notifications":
        return (
          <div className="settings-content">
            <h2 className="section-title">Notifications</h2>
            
            <div className="notification-section">
              <h3 className="subsection-title">Email notification</h3>
              <p className="subsection-description">
                Get emails to find out what's going on when you're not online. You can turn these off.
              </p>
              
              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>News</h4>
                    <p>News about products and feature updates.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications.news}
                      onChange={() => toggleEmailNotification("news")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Updates</h4>
                    <p>Intent's updates.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications.updates}
                      onChange={() => toggleEmailNotification("updates")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>User research</h4>
                    <p>Users can run the timeline program or participate in such product user reviews.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications.userResearch}
                      onChange={() => toggleEmailNotification("userResearch")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Reminders</h4>
                    <p>These are notifications to remind you of updating your right item manual.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications.reminders}
                      onChange={() => toggleEmailNotification("reminders")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="notification-section">
              <h3 className="subsection-title">Push notification</h3>
              <p className="subsection-description">
                Get push notification to, app to find out what's going on when you're online.
              </p>
              
              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Reminders</h4>
                    <p>These are notifications to remind you of updating your right item manual.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={pushNotifications.reminders}
                      onChange={() => togglePushNotification("reminders")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>More activity about you</h4>
                    <p>These are notifications for posts on your phone, with each other headlining to your posts, and more.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={pushNotifications.activity}
                      onChange={() => togglePushNotification("activity")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "health":
        return (
          <div className="settings-content">
            <h2 className="section-title">Health Preferences</h2>
            
            <div className="form-section">
              <label className="form-label">Medical Conditions</label>
              <div className="tags-input">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addMedicalCondition()}
                  placeholder="Add medical condition and press Enter"
                  className="form-input"
                />
                <button onClick={addMedicalCondition} className="btn-tag">Add</button>
              </div>
              <div className="tags-list">
                {healthPreferences.medical_conditions.map((condition, index) => (
                  <span key={index} className="tag">
                    {condition}
                    <button onClick={() => removeMedicalCondition(index)} className="tag-remove">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Ayurvedic Body Type</label>
              <select
                className="form-input"
                value={healthPreferences.ayurvedic_body_type}
                onChange={(e) =>
                  setHealthPreferences({ ...healthPreferences, ayurvedic_body_type: e.target.value })
                }
              >
                <option value="">Select Body Type</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Vata-Kapha">Vata-Kapha</option>
                <option value="Pitta-Kapha">Pitta-Kapha</option>
                <option value="Tridosha">Tridosha</option>
              </select>
            </div>

            <div className="form-section">
              <label className="form-label">Custom Health Notes</label>
              <textarea
                className="form-input"
                value={healthPreferences.health_notes}
                onChange={(e) =>
                  setHealthPreferences({ ...healthPreferences, health_notes: e.target.value })
                }
                placeholder="Add any additional health notes or preferences"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button className="save-btn" onClick={updateHealthPreferences} disabled={saving}>
              {saving ? "Saving..." : "Save Health Preferences"}
            </button>
          </div>
        );

      case "ui": // CHANGED: This replaces the "social" section
        return (
          <div className="settings-content">
            <h2 className="section-title">App UI Preferences</h2>
            
            <div className="form-section">
              <label className="form-label">Theme</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={uiPreferences.theme === "light"}
                    onChange={(e) => setUiPreferences({ ...uiPreferences, theme: e.target.value })}
                  />
                  <span>Light</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={uiPreferences.theme === "dark"}
                    onChange={(e) => setUiPreferences({ ...uiPreferences, theme: e.target.value })}
                  />
                  <span>Dark</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Time Format</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="time_format"
                    value="12"
                    checked={uiPreferences.time_format === "12"}
                    onChange={(e) => setUiPreferences({ ...uiPreferences, time_format: e.target.value })}
                  />
                  <span>12-hour</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="time_format"
                    value="24"
                    checked={uiPreferences.time_format === "24"}
                    onChange={(e) => setUiPreferences({ ...uiPreferences, time_format: e.target.value })}
                  />
                  <span>24-hour</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Language</label>
              <select
                className="form-input"
                value={uiPreferences.language}
                onChange={(e) => setUiPreferences({ ...uiPreferences, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            <button className="save-btn" onClick={updateUiPreferences} disabled={saving}>
              {saving ? "Saving..." : "Save UI Preferences"}
            </button>
          </div>
        );

      case "security":
        return (
          <div className="settings-content">
            <h2 className="section-title">Password & Security</h2>
            
            <div className="form-section">
              <label className="form-label">Enter Current Password</label>
              <input 
                type="password" 
                className="form-input"
                value={password.current_password}
                onChange={(e) => setPassword({...password, current_password: e.target.value})}
                placeholder="Current password"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Enter new Password</label>
              <input 
                type="password" 
                className="form-input"
                value={password.new_password}
                onChange={(e) => setPassword({...password, new_password: e.target.value})}
                placeholder="New password"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Confirm new password</label>
              <input 
                type="password" 
                className="form-input"
                value={password.confirm_password}
                onChange={(e) => setPassword({...password, confirm_password: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>

            <button className="save-btn" onClick={changePassword} disabled={saving}>
              {saving ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        );

      case "delete":
        return (
          <div className="settings-content">
            <h2 className="section-title delete-title">Delete your account</h2>
            <div className="delete-warning">
              <p className="warning-text">
                When you delete your account, you lose access to Front account services, 
                and we permanently delete your personal data. You can cancel the deletion for 14 days.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  className="delete-account-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              ) : (
                <div className="delete-confirm-section">
                  <label className="form-label">
                    Confirm that <strong>I want to delete my account</strong> by typing "DELETE MY ACCOUNT"
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                  />
                  <div className="delete-actions">
                    <button 
                      className="confirm-delete-btn"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== "DELETE MY ACCOUNT"}
                    >
                      <FaTrash /> Confirm Delete
                    </button>
                    <button 
                      className="cancel-delete-btn"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirm("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="learn-more">
              <a href="#" className="learn-more-link">Learn more</a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1 className="settings-title">Account / Setting</h1>
      </header>

      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeSection === "basic" ? "active" : ""}`}
              onClick={() => setActiveSection("basic")}
            >
              <FaUser className="nav-icon" />
              <span>Basic Information</span>
            </button>

            <button 
              className={`nav-item ${activeSection === "notifications" ? "active" : ""}`}
              onClick={() => setActiveSection("notifications")}
            >
              <FaBell className="nav-icon" />
              <span>Notifications</span>
            </button>

            <button 
              className={`nav-item ${activeSection === "health" ? "active" : ""}`}
              onClick={() => setActiveSection("health")}
            >
              <FaHeart className="nav-icon" />
              <span>Health Preferences</span>
            </button>

            <button 
              className={`nav-item ${activeSection === "ui" ? "active" : ""}`}
              onClick={() => setActiveSection("ui")}
            >
              <FaPalette className="nav-icon" />
              <span>App UI Preferences</span>
            </button>

            <button 
              className={`nav-item ${activeSection === "security" ? "active" : ""}`}
              onClick={() => setActiveSection("security")}
            >
              <FaLock className="nav-icon" />
              <span>Password & Security</span>
            </button>

            <button 
              className={`nav-item ${activeSection === "delete" ? "active" : ""}`}
              onClick={() => setActiveSection("delete")}
            >
              <FaTrash className="nav-icon" />
              <span>Delete Account</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="settings-main">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}