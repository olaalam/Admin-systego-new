// src/context/TenantContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/api/api";

const TenantContext = createContext({
  features: {
    haveEcommerce: true,
    haveMobileApp: false,
    havePOS: false,
    haveReports: false,
    haveStockTake: false,
  },
  tenant: null,
  packageInfo: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export const useTenantInfo = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenantInfo must be used within a TenantProvider");
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [features, setFeatures] = useState({
    haveEcommerce: true,
    haveMobileApp: false,
    havePOS: false,
    haveReports: false,
    haveStockTake: false,
  });
  const [tenant, setTenant] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenantInfo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/tenant-info");
      const data = res.data?.data || res.data;

      if (data) {
        if (data.features) {
          setFeatures({
            haveEcommerce: Boolean(data.features.haveEcommerce),
            haveMobileApp: Boolean(data.features.haveMobileApp),
            havePOS: Boolean(data.features.havePOS),
            haveReports: Boolean(data.features.haveReports),
            haveStockTake: Boolean(data.features.haveStockTake),
          });
        }
        if (data.tenant) setTenant(data.tenant);
        if (data.package) setPackageInfo(data.package);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tenant info:", err);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTenant = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/admin/tenant-info/refresh", {});
      const data = res.data?.data || res.data;

      if (data) {
        if (data.features) {
          setFeatures({
            haveEcommerce: Boolean(data.features.haveEcommerce),
            haveMobileApp: Boolean(data.features.haveMobileApp),
            havePOS: Boolean(data.features.havePOS),
            haveReports: Boolean(data.features.haveReports),
            haveStockTake: Boolean(data.features.haveStockTake),
          });
        }
        if (data.tenant) setTenant(data.tenant);
        if (data.package) setPackageInfo(data.package);
      }
      setError(null);
      return data;
    } catch (err) {
      console.error("Failed to refresh tenant info:", err);
      setError(err?.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenantInfo();
  }, [fetchTenantInfo]);

  return (
    <TenantContext.Provider
      value={{
        features,
        tenant,
        packageInfo,
        loading,
        error,
        refetch: fetchTenantInfo,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
