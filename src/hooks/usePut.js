// src/hooks/usePut.js
import { useState } from "react";
import api from "@/api/api";

export default function usePut(url) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putData = async (body) => {
    try {
      setLoading(true);
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
