import React, { createContext, useContext, useState, useEffect } from "react";
import { apiGet } from "../api";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("role") || "PATIENT");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  // Load user profile and settings on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [theme]);

  const loadUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentRole = localStorage.getItem("role") || "PATIENT";
      setRole(currentRole);

      // Load correct profile based on role
      let profileRes;
      if (currentRole === "DOCTOR") {
        profileRes = await apiGet("/api/clinic/doctor/dashboard/", token);
      } else if (currentRole === "THERAPIST") {
        profileRes = await apiGet("/api/clinic/therapist/dashboard/", token);
      } else {
        profileRes = await apiGet("/api/patient/profile/", token);
      }

      if (profileRes && profileRes.success) {
        // Normalize user object based on response from different roles
        const data = profileRes.data || profileRes; // dashboard yields direct data sometimes
        setUser({
          name: data.full_name || data.doctor_name || data.therapist_name || data.name || "",
          email: data.user_email || data.email || "",
          role: currentRole,
          data: data // store full data for dashboard use
        });
      }

      // Load settings (theme, language)
      const settingsRes = await apiGet("/api/user/settings/", token);
      if (settingsRes && settingsRes.success && settingsRes.data) {
        const settings = settingsRes.data;
        setTheme(settings.theme || "light");
        setLanguage(settings.language || "en");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    // Save to backend
    const token = localStorage.getItem("token");
    if (token) {
      apiGet("/api/user/settings/", token).then((res) => {
        if (res && res.success) {
          const settings = { ...res.data, theme: newTheme };
          fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/user/settings/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(settings),
          });
        }
      });
    }
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    // Save to backend
    const token = localStorage.getItem("token");
    if (token) {
      apiGet("/api/user/settings/", token).then((res) => {
        if (res && res.success) {
          const settings = { ...res.data, language: newLanguage };
          fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/user/settings/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(settings),
          });
        }
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        theme,
        setTheme: updateTheme,
        language,
        setLanguage: updateLanguage,
        loading,
        loadUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

