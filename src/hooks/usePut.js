// src/hooks/usePut.js
import { useState } from "react";
import api from "@/api/api";

export default function usePut(defaultUrl = "") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putData = async (body, customUrl = null) => {
    try {
      setLoading(true);
      const url = customUrl || defaultUrl;
      const res = await api.put(url, body);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { putData, loading, error };
}
