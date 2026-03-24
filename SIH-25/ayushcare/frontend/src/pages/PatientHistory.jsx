import React, { useState, useMemo } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaDownload,
  FaFileMedical,
  FaSearch,
  FaFilter,
  FaHeartbeat,
  FaStethoscope
} from "react-icons/fa";
import "./PatientHistory.css";

export default function PatientHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 🔹 Dummy patient info
  const patientInfo = {
    name: "Anirudh Yadav",
    age: 29,
    gender: "Male",
    contact: "+91 98765 43210",
    lastVisit: "2025-02-18",
    doctor: "Dr. Meera Shankar",
    patientId: "PAT-2024-001",
    bloodGroup: "B+",
    allergies: "None"
  };

  // 🔹 Dummy medical history
  const medicalHistory = [
    {
      date: "2025-01-10",
      diagnosis: "Digestive Imbalance",
      treatment: "Virechana Therapy",
      duration: "7 Days",
      doctor: "Dr. Meera Shankar",
      status: "Completed",
      severity: "Moderate"
    },
    {
      date: "2025-02-02",
      diagnosis: "Stress & Anxiety",
      treatment: "Shirodhara",
      duration: "5 Sessions",
      doctor: "Dr. Rajesh Nair",
      status: "Completed",
      severity: "Mild"
    },
    {
      date: "2025-03-12",
      diagnosis: "Joint Pain",
      treatment: "Abhyanga Massage",
      duration: "10 Days",
      doctor: "Dr. Sneha Patel",
      status: "Ongoing",
      severity: "Moderate"
    },
    {
      date: "2025-04-18",
      diagnosis: "Insomnia",
      treatment: "Nasya Therapy",
      duration: "1 Week",
      doctor: "Dr. Meera Shankar",
      status: "Follow-up Needed",
      severity: "Mild"
    },
    {
      date: "2025-05-08",
      diagnosis: "Detox & Rejuvenation",
      treatment: "Panchakarma Cleanse",
      duration: "14 Days",
      doctor: "Dr. Rajesh Nair",
      status: "Completed",
      severity: "Low"
    },
  ];

  // 🔹 Search and filter logic
  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = medicalHistory;

    if (q) {
      filtered = filtered.filter(
        (r) =>
          r.date.includes(q) ||
          r.diagnosis.toLowerCase().includes(q) ||
          r.treatment.toLowerCase().includes(q) ||
          r.doctor.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  }, [search, statusFilter, medicalHistory]);

  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case "Completed":
          return { class: "completed", label: "Completed" };
        case "Ongoing":
          return { class: "ongoing", label: "In Progress" };
        case "Follow-up Needed":
          return { class: "follow", label: "Follow-up" };
        default:
          return { class: "default", label: status };
      }
    };

    const config = getStatusConfig(status);
    return <span className={`status ${config.class}`}>{config.label}</span>;
  };

  const SeverityIndicator = ({ severity }) => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case "Low": return "#27AE60";
        case "Mild": return "#F39C12";
        case "Moderate": return "#E67E22";
        case "High": return "#E74C3C";
        default: return "#95A5A6";
      }
    };

    return (
      <div className="severity-indicator">
        <div 
          className="severity-dot" 
          style={{ backgroundColor: getSeverityColor(severity) }}
        />
        <span>{severity}</span>
      </div>
    );
  };

  return (
    <div className="patient-history-root">
      {/* Page Header */}
      <div className="history-header">
        <div className="header-content">
          <div className="header-title-section">
            <FaFileMedical className="header-icon" />
            <div>
              <h1>Patient History</h1>
              <p className="subtitle">
                Comprehensive overview of treatments, diagnoses, and wellness journey
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-export">
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Patient Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">
            <FaUser />
          </div>
          <div className="summary-content">
            <h3>Total Visits</h3>
            <span className="summary-value">12</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon ongoing-therapy">
            <FaHeartbeat />
          </div>
          <div className="summary-content">
            <h3>Active Treatments</h3>
            <span className="summary-value">2</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon completed-therapy">
            <FaStethoscope />
          </div>
          <div className="summary-content">
            <h3>Completed</h3>
            <span className="summary-value">8</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column - Patient Info */}
        <div className="left-column">
          {/* Personal Details Card */}
          <section className="info-card personal-card">
            <div className="card-header">
              <FaUser className="card-icon" />
              <h2>Personal Details</h2>
            </div>
            <div className="personal-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{patientInfo.name}</span>
              </div>
              <div className="info-item">
                <label>Age</label>
                <span>{patientInfo.age} years</span>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <span>{patientInfo.gender}</span>
              </div>
              <div className="info-item">
                <label>Contact</label>
                <span>{patientInfo.contact}</span>
              </div>
              <div className="info-item">
                <label>Last Visit</label>
                <span>{patientInfo.lastVisit}</span>
              </div>
              <div className="info-item">
                <label>Primary Doctor</label>
                <span>{patientInfo.doctor}</span>
              </div>
              <div className="info-item">
                <label>Patient ID</label>
                <span className="patient-id">{patientInfo.patientId}</span>
              </div>
              <div className="info-item">
                <label>Blood Group</label>
                <span>{patientInfo.bloodGroup}</span>
              </div>
              <div className="info-item">
                <label>Allergies</label>
                <span>{patientInfo.allergies}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Medical History */}
        <div className="right-column">
          <section className="info-card table-card">
            <div className="card-header">
              <FaCalendarAlt className="card-icon" />
              <h2>Medical History</h2>
            </div>

            {/* Filters */}
            <div className="table-filters">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by date, diagnosis, treatment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Follow-up Needed">Follow-up</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Severity</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="6">
                        <div className="no-results">
                          <FaSearch />
                          <p>No records found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((row, i) => (
                      <tr key={i}>
                        <td className="date-cell">
                          <div className="date-display">
                            <span className="date-day">{new Date(row.date).getDate()}</span>
                            <span className="date-month">{new Date(row.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="date-year">{new Date(row.date).getFullYear()}</span>
                          </div>
                        </td>
                        <td className="diagnosis-cell">
                          <strong>{row.diagnosis}</strong>
                          <span className="treatment-name">{row.treatment}</span>
                        </td>
                        <td>{row.treatment}</td>
                        <td>
                          <SeverityIndicator severity={row.severity} />
                        </td>
                        <td className="doctor-cell">{row.doctor}</td>
                        <td>
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="page-btn prev">Previous</button>
              <div className="page-info">Page 1 of 2</div>
              <button className="page-btn next">Next</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}