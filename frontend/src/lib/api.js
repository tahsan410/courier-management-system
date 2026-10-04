// Single place for the backend URL + request handling.
// Override at build time with VITE_API_URL (e.g. http://127.0.0.1:8000).

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://courier-management-system-fiss.onrender.com"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractMessage(data, fallback) {
  if (Array.isArray(data?.detail)) {
    return data.detail.map((i) => i.msg || "Invalid input").join(", ");
  }
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  return fallback;
}

export async function apiRequest(
  path,
  { method = "GET", body, auth = false, params } = {}
) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let url = `${API_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check your connection — the server may also be waking up, so please retry in a few seconds.",
      0
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new ApiError(
      extractMessage(data, `Request failed (${res.status})`),
      res.status
    );
  }

  return data;
}

// ---------------------------------------------------------
// Endpoints (1:1 with backend/main.py)
// ---------------------------------------------------------
export const api = {
  signup: (payload) => apiRequest("/signup", { method: "POST", body: payload }),

  login: (payload) => apiRequest("/login", { method: "POST", body: payload }),

  forgotPassword: (email) =>
    apiRequest("/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token, new_password) =>
    apiRequest("/reset-password", {
      method: "POST",
      body: { token, new_password },
    }),

  bookParcel: (payload) =>
    apiRequest("/parcels/book", { method: "POST", body: payload, auth: true }),

  myParcels: () => apiRequest("/parcels/my", { auth: true }),

  trackParcel: (code) =>
    apiRequest(`/parcels/track/${encodeURIComponent(code)}`),

  cancelParcel: (id) =>
    apiRequest(`/parcels/cancel/${id}`, { method: "PUT", auth: true }),

  adminParcels: (params) =>
    apiRequest("/admin/parcels", { auth: true, params }),

  adminUpdateStatus: (id, status) =>
    apiRequest(`/admin/parcels/${id}/status`, {
      method: "PUT",
      body: { status },
      auth: true,
    }),

  adminDeleteParcel: (id) =>
    apiRequest(`/admin/parcels/${id}`, { method: "DELETE", auth: true }),
};
