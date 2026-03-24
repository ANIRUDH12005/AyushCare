import React, { useState } from "react";
import "./Progresstracking.css";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip
);

export default function ProgressTracking() {
  const [activeTab, setActiveTab] = useState("self");

  /* =============================
     CIRCULAR METERS DATA
  ============================== */
  const selfMeters = [
    { label: "Pain", value: 30, color: "#E74C3C" },
    { label: "Sleep", value: 75, color: "#3498DB" },
    { label: "Energy", value: 60, color: "#27AE60" },
    { label: "Stress", value: 45, color: "#F39C12" },
  ];

  const therapistMeters = [
    { label: "Therapy Completion", value: 65, color: "#6C5CE7" },
    { label: "Agni Strength", value: 72, color: "#E67E22" },
    { label: "Dosha Balance", value: 80, color: "#00B894" },
    { label: "Vital Stability", value: 88, color: "#E84393" },
  ];

  /* =============================
     BAR GRAPH DATA
  ============================== */
  const selfBarData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    datasets: [
      {
        label: "Daily Wellness Score",
        data: [40, 50, 60, 65, 75],
        backgroundColor: "rgba(108,92,231,0.8)",
        borderRadius: 12,
      },
    ],
  };

  const therapistBarData = {
    labels: ["Session 1", "Session 2", "Session 3", "Session 4"],
    datasets: [
      {
        label: "Therapy Effectiveness",
        data: [50, 60, 72, 85],
        backgroundColor: "rgba(46,204,113,0.85)",
        borderRadius: 12,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  /* =============================
     UI HELPERS
  ============================== */
  const CircularMeter = ({ value, label, color }) => (
    <div className="meter-card">
      <Doughnut
        data={{
          datasets: [
            {
              data: [value, 100 - value],
              backgroundColor: [color, "#ECECEC"],
              borderWidth: 0,
            },
          ],
        }}
        options={{ cutout: "75%" }}
      />
      <div className="meter-center">
        <h3>{value}%</h3>
        <p>{label}</p>
      </div>
    </div>
  );

  return (
    <div className="progress-container">

      <h1>Progress Tracking</h1>
      <p className="subtitle">Visual insights into your healing journey</p>

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "self" ? "active" : ""}
          onClick={() => setActiveTab("self")}
        >
          Self Observation
        </button>
        <button
          className={activeTab === "therapist" ? "active" : ""}
          onClick={() => setActiveTab("therapist")}
        >
          Therapist Observation
        </button>
      </div>

      {/* =============================
         CIRCULAR METERS SECTION
      ============================== */}
      <div className="meters-grid">
        {(activeTab === "self" ? selfMeters : therapistMeters).map(
          (m, i) => (
            <CircularMeter key={i} {...m} />
          )
        )}
      </div>

      {/* =============================
         BAR GRAPHS SECTION
      ============================== */}
      <div className="bar-section">
        <h2>
          {activeTab === "self"
            ? "Daily Self Observation Trend"
            : "Clinical Progress Trend"}
        </h2>

        <Bar
          data={activeTab === "self" ? selfBarData : therapistBarData}
          options={barOptions}
        />
      </div>
    </div>
  );
}
