import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut } from "../api";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    height: "",
    weight: "",
    allergies: "",
    current_conditions: "",
    medication: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await apiGet("/api/patient/profile/", token);
    if (res.success) {
      setProfile(res.data);
      setForm(res.data);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async () => {
    const url = profile
      ? "/api/patient/profile/update/"
      : "/api/patient/profile/create/";

    const method = profile ? apiPut : apiPost;

    const res = await method(url, form, token);

    if (res.success) {
      alert("Profile saved successfully!");
      loadProfile();
    } else {
      alert("Error saving profile");
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <div className="profile-form">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ").toUpperCase()}
            value={form[key]}
            onChange={handleChange}
          />
        ))}

        <button onClick={saveProfile}>Save Profile</button>
      </div>
    </div>
  );
}
