// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://bcknd.systego.net", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor لو محتاجة تضيفي توكن أو تعملي لوجين
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
