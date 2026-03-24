// src/pages/Centers.jsx
import React, { useEffect, useState, useMemo } from "react";
import { apiGet } from "../api";
import CenterCard from "./CenterCard";
import { useNavigate } from "react-router-dom";

export default function Centers() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [centers, setCenters] = useState([]);
  const [userCity, setUserCity] = useState(null);

  useEffect(() => {
    loadCenters();
    loadUserProfile();
  }, []);

  async function loadCenters() {
    const res = await apiGet("/api/centers/", token);
    if (Array.isArray(res)) {
      setCenters(res);
    } else if (res?.results) {
      setCenters(res.results);
    } else {
      setCenters([]);
    }
  }

  // SAFE profile loader (will NOT break UI)
  async function loadUserProfile() {
    try {
      const profile = await apiGet("/api/patient/profile/", token);
      if (profile?.city) {
        setUserCity(profile.city);
      } else if (profile?.data?.city) {
        setUserCity(profile.data.city);
      }
    } catch (err) {
      console.warn("Profile load failed, continuing without city");
      setUserCity(null);
    }
  }

  const onOpen = (centerId) => {
    navigate(`/centers/${centerId}`);
  };

  /* -----------------------------
     ✅ PERMANENT & SAFE LOGIC
  ------------------------------ */

  const { famous, closest, others } = useMemo(() => {
    if (!centers.length) {
      return { famous: [], closest: [], others: [] };
    }

    // Famous = first 6
    const famousCenters = centers.slice(0, 6);
    const famousIds = new Set(famousCenters.map(c => c.id));

    // Closest (city match)
    const closestCenters = userCity
      ? centers.filter(
          c =>
            c.city &&
            c.city.toLowerCase() === userCity.toLowerCase() &&
            !famousIds.has(c.id)
        )
      : [];

    const closestIds = new Set(closestCenters.map(c => c.id));

    // Others = remaining
    const otherCenters = centers.filter(
      c => !famousIds.has(c.id) && !closestIds.has(c.id)
    );

    return {
      famous: famousCenters,
      closest: closestCenters,
      others: otherCenters,
    };
  }, [centers, userCity]);

  return (
    <div className="page-centers" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Panchakarma Centers</h2>
        <div>
          <input placeholder="Search centers..." />
          <button style={{ marginLeft: 8 }}>
            {userCity ? userCity : "Detect location"}
          </button>
        </div>
      </div>

      {/* Famous */}
      <section style={{ marginTop: 20 }}>
        <h3>Famous Centers</h3>
        <div className="centers-grid">
          {famous.length
            ? famous.map(c => (
                <CenterCard key={c.id} center={c} onOpen={onOpen} />
              ))
            : <p>No famous centers yet.</p>}
        </div>
      </section>

      {/* Closest */}
      <section style={{ marginTop: 30 }}>
        <h3>Closest Centers</h3>
        <div className="centers-grid">
          {closest.length
            ? closest.map(c => (
                <CenterCard key={c.id} center={c} onOpen={onOpen} />
              ))
            : <p>No centers found in your city.</p>}
        </div>
      </section>

      {/* Others */}
      <section style={{ marginTop: 30 }}>
        <h3>Other Centers</h3>
        <div className="centers-grid">
          {others.length
            ? others.map(c => (
                <CenterCard key={c.id} center={c} onOpen={onOpen} />
              ))
            : <p>No other centers found.</p>}
        </div>
      </section>
    </div>
  );
}
