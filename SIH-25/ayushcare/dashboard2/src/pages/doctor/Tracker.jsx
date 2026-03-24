import React from 'react';
import './DoctorPages.css';

// Mock data for visualization
const trackerData = {
  totalPatients: 156,
  genderDistribution: {
    male: 72,
    female: 84
  },
  ageDistribution: {
    under25: 42,
    '25-50': 78,
    '51-65': 28,
    over65: 8
  },
  monthlyStats: [
    { month: 'Jan', patients: 45 },
    { month: 'Feb', patients: 52 },
    { month: 'Mar', patients: 48 },
    { month: 'Apr', patients: 60 },
    { month: 'May', patients: 55 },
    { month: 'Jun', patients: 65 }
  ],
  therapyTypes: [
    { name: 'Panchakarma', count: 45 },
    { name: 'Shirodhara', count: 32 },
    { name: 'Basti', count: 28 },
    { name: 'Nasya', count: 25 },
    { name: 'Raktamokshana', count: 16 },
    { name: 'Other', count: 10 }
  ]
};

const Tracker = () => {
  // Calculate percentages
  const malePercentage = Math.round((trackerData.genderDistribution.male / trackerData.totalPatients) * 100);
  const femalePercentage = Math.round((trackerData.genderDistribution.female / trackerData.totalPatients) * 100);

  return (
    <div className="page-root">
      <div className="page-header">
        <h1 className="page-title">Monthly Tracker</h1>
        <p className="page-subtitle">Analytics & Patient Demographics for December 2025</p>
      </div>

      {/* Overview Cards */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <span>👥</span>
          </div>
          <div className="stat-content">
            <h3>Total Patients</h3>
            <p className="stat-number">{trackerData.totalPatients}</p>
            <p className="stat-label">This Month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4ECDC4, #44A08D)' }}>
            <span>♂️</span>
          </div>
          <div className="stat-content">
            <h3>Male Patients</h3>
            <p className="stat-number">{trackerData.genderDistribution.male}</p>
            <p className="stat-label">{malePercentage}% of total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B6B, #C44D58)' }}>
            <span>♀️</span>
          </div>
          <div className="stat-content">
            <h3>Female Patients</h3>
            <p className="stat-number">{trackerData.genderDistribution.female}</p>
            <p className="stat-label">{femalePercentage}% of total</p>
          </div>
        </div>
      </div>

      {/* Visualization Section */}
      <div className="section-block">
        <h3 className="section-title">Gender Distribution</h3>
        <div className="gender-chart">
          <div className="chart-container">
            <div className="chart-bar-container">
              <div className="chart-bar-label">Male</div>
              <div className="chart-bar-bg">
                <div 
                  className="chart-bar-fill male"
                  style={{ width: `${malePercentage}%` }}
                >
                  <span className="chart-bar-value">{trackerData.genderDistribution.male}</span>
                </div>
              </div>
              <div className="chart-bar-percentage">{malePercentage}%</div>
            </div>
            
            <div className="chart-bar-container">
              <div className="chart-bar-label">Female</div>
              <div className="chart-bar-bg">
                <div 
                  className="chart-bar-fill female"
                  style={{ width: `${femalePercentage}%` }}
                >
                  <span className="chart-bar-value">{trackerData.genderDistribution.female}</span>
                </div>
              </div>
              <div className="chart-bar-percentage">{femalePercentage}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Age Distribution */}
      <div className="section-block">
        <h3 className="section-title">Age Distribution</h3>
        <div className="grid-3">
          <div className="age-card">
            <div className="age-range">Under 25</div>
            <div className="age-count">{trackerData.ageDistribution.under25}</div>
            <div className="age-percentage">
              {Math.round((trackerData.ageDistribution.under25 / trackerData.totalPatients) * 100)}%
            </div>
          </div>
          
          <div className="age-card">
            <div className="age-range">25 - 50</div>
            <div className="age-count">{trackerData.ageDistribution['25-50']}</div>
            <div className="age-percentage">
              {Math.round((trackerData.ageDistribution['25-50'] / trackerData.totalPatients) * 100)}%
            </div>
          </div>
          
          <div className="age-card">
            <div className="age-range">51 - 65</div>
            <div className="age-count">{trackerData.ageDistribution['51-65']}</div>
            <div className="age-percentage">
              {Math.round((trackerData.ageDistribution['51-65'] / trackerData.totalPatients) * 100)}%
            </div>
          </div>
          
          <div className="age-card">
            <div className="age-range">Over 65</div>
            <div className="age-count">{trackerData.ageDistribution.over65}</div>
            <div className="age-percentage">
              {Math.round((trackerData.ageDistribution.over65 / trackerData.totalPatients) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="section-block">
        <h3 className="section-title">Monthly Patient Trends</h3>
        <div className="monthly-trend">
          <div className="trend-chart">
            {trackerData.monthlyStats.map((month, index) => {
              const maxPatients = Math.max(...trackerData.monthlyStats.map(m => m.patients));
              const height = (month.patients / maxPatients) * 150;
              
              return (
                <div key={index} className="trend-bar-container">
                  <div className="trend-bar" style={{ height: `${height}px` }}>
                    <span className="trend-value">{month.patients}</span>
                  </div>
                  <div className="trend-label">{month.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Therapy Types */}
      <div className="section-block">
        <h3 className="section-title">Therapy Distribution</h3>
        <div className="therapy-list">
          {trackerData.therapyTypes.map((therapy, index) => {
            const percentage = Math.round((therapy.count / trackerData.totalPatients) * 100);
            
            return (
              <div key={index} className="therapy-item">
                <div className="therapy-info">
                  <span className="therapy-name">{therapy.name}</span>
                  <span className="therapy-count">{therapy.count} patients</span>
                </div>
                <div className="therapy-bar">
                  <div 
                    className="therapy-progress" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="therapy-percentage">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tracker; 