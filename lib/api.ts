import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  // Do NOT set Content-Type here — Axios will auto-set it per request:
  //   JSON body   → application/json
  //   FormData    → multipart/form-data (with correct boundary)
  // Hardcoding application/json breaks multipart file uploads (causes 422).
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
