  // src/api.js
  // Use environment variable with fallback for development
  export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  function buildHeaders(token = null) {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  export async function apiPost(url, body, token = null) {
    const full = BASE_URL + url;
    console.log("[apiPost] ->", full, "token?", !!token, "body:", body);

    try {
      const res = await fetch(full, {
        method: "POST",
        headers: buildHeaders(token),
        body: JSON.stringify(body),
      });

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, message: "Invalid JSON", raw: text };
      }
    } catch (err) {
      return { success: false, message: "Network error", error: String(err) };
    }
  }

  export async function apiGet(url, token = null) {
    const full = BASE_URL + url;
    console.log("[apiGet] ->", full);

    try {
      const res = await fetch(full, {
        method: "GET",
        headers: buildHeaders(token),
      });

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, message: "Invalid JSON", raw: text };
      }
    } catch (err) {
      return { success: false, message: "Network error", error: String(err) };
    }
  }

  export async function apiPut(url, body, token = null) {
    const full = BASE_URL + url;

    try {
      const res = await fetch(full, {
        method: "PUT",
        headers: buildHeaders(token),
        body: JSON.stringify(body),
      });

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, message: "Invalid JSON", raw: text };
      }
    } catch (err) {
      return { success: false, message: "Network error", error: String(err) };
    }
  }

  /* --------------------------
    NEW ENDPOINT HELPERS
  --------------------------- */

  // Get all centers
  export function getCenters(token) {
    return apiGet("/api/centers/", token);
  }

  // Get doctors belonging to a center
  export function getDoctorsByCenter(center_id, token) {
    return apiGet(`/api/appointments/center/${center_id}/doctors/`, token);
  }

  // Create appointment 
  export function createAppointment(body, token) {
    return apiPost("/api/appointments/create/", body, token);
  }
