// src/hooks/useGet.js
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/api";

export default function useGet(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (overrideOptions = {}) => {
    if (!url) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(url, { ...options, ...overrideOptions });

      if (res.data?.success) {
        setData(res.data?.data); // ✅ نخزن الـ data مباشرة
      } else {
        const msg =
          res.data?.error?.message ||
          res.data?.message ||
          "Something went wrong!";
        toast.error(msg, { position: "top-right", autoClose: 3000 });
        setError(msg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Request failed";

      setError(errorMsg);

      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
