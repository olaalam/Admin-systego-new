// src/Pages/Shipping/Shipping.jsx
import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import SelfCard from "./SelfCard";
import BostaCard from "./BostaCard";
import AramexCard from "./AramexCard";
import FreeShippingCard from "./FreeShippingCard";

const Shipping = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useGet("/api/admin/shipping/settings");

  const { data: warehouseData } = useGet("/api/admin/warehouse");

  const { putData, loading: savingSettings } = usePut(
    "/api/admin/shipping/settings",
  );

  const [activeMethod, setActiveMethod] = useState("self");

  const [selfForm, setSelfForm] = useState({
    enabled: true,
    method: "zone",
    flatRate: 0,
  });

  const [bostaForm, setBostaForm] = useState({
    enabled: false,
    apiKey: "",
    baseUrl: "https://app.bosta.co/api/v2",
    environment: "production",
    pickup: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      city: "",
      cityId: "",
      zoneId: "",
      districtId: "",
      firstLine: "",
      secondLine: "",
      buildingNumber: "",
      floor: "",
      apartment: "",
    },
    defaults: {
      packageType: "Parcel",
      size: "MEDIUM",
      weight: 1,
      itemsCount: 1,
      description: "Order",
    },
    codEnabled: true,
    // 🆕 Shipping Markup
    shippingMarkup: 0,
    shippingMarkupType: "fixed",
  });

  const [freeShipping, setFreeShipping] = useState(false);

  useEffect(() => {
    if (!settingsData?.settings) return;
    const s = settingsData.settings;

    setActiveMethod(s.activeMethod || "self");
    setFreeShipping(s.freeShippingEnabled || false);

    setSelfForm({
      enabled: s.self?.enabled !== false,
      method: s.self?.method || "zone",
      flatRate: s.self?.flatRate || 0,
    });

    setBostaForm({
      enabled: s.bosta?.enabled === true,
      apiKey: s.bosta?.apiKey || "",
      baseUrl: s.bosta?.baseUrl || "https://app.bosta.co/api/v2",
      environment: s.bosta?.environment || "production",
      pickup: {
        firstName: s.bosta?.pickup?.firstName || "",
        lastName: s.bosta?.pickup?.lastName || "",
        phone: s.bosta?.pickup?.phone || "",
        email: s.bosta?.pickup?.email || "",
        city: s.bosta?.pickup?.city || "",
        cityId: s.bosta?.pickup?.cityId || "",
        zoneId: s.bosta?.pickup?.zoneId || "",
        districtId: s.bosta?.pickup?.districtId || "",
        firstLine: s.bosta?.pickup?.firstLine || "",
        secondLine: s.bosta?.pickup?.secondLine || "",
        buildingNumber: s.bosta?.pickup?.buildingNumber || "",
        floor: s.bosta?.pickup?.floor || "",
        apartment: s.bosta?.pickup?.apartment || "",
      },
      defaults: {
        packageType: s.bosta?.defaults?.packageType || "Parcel",
        size: s.bosta?.defaults?.size || "MEDIUM",
        weight: s.bosta?.defaults?.weight || 1,
        itemsCount: s.bosta?.defaults?.itemsCount || 1,
        description: s.bosta?.defaults?.description || "Order",
      },
      codEnabled: s.bosta?.codEnabled !== false,
      // 🆕 Shipping Markup
      shippingMarkup: s.bosta?.shippingMarkup || 0,
      shippingMarkupType: s.bosta?.shippingMarkupType || "fixed",
    });
  }, [settingsData]);

  const warehouses = warehouseData?.warehouses || warehouseData || [];
  const onlineWarehouse = Array.isArray(warehouses)
    ? warehouses.find((w) => w.Is_Online === true)
    : null;

  const handleActiveMethodChange = async (val) => {
    setActiveMethod(val);
    try {
      await putData({ activeMethod: val });
      toast.success(
        t("Active_method_updated") || "Active shipping method updated",
      );
      refetchSettings();
    } catch (err) {
      setActiveMethod(activeMethod);
      toast.error(t("Failed_to_update") || "Failed to update");
    }
  };

  const handleSaveSelf = async () => {
    try {
      await putData({
        activeMethod,
        self: selfForm,
      });
      toast.success(t("Self_settings_saved") || "Self settings saved");
      refetchSettings();
    } catch (err) {
      toast.error(t("Failed_to_save") || "Failed to save");
    }
  };

  const handleSaveBosta = async () => {
    try {
      await putData({
        activeMethod,
        bosta: bostaForm,
      });
      toast.success(t("Bosta_settings_saved") || "Bosta settings saved");
      refetchSettings();
    } catch (err) {
      toast.error(t("Failed_to_save") || "Failed to save");
    }
  };

  const handleFreeShippingToggle = async (val) => {
    setFreeShipping(val);
    try {
      await putData({ freeShippingEnabled: val });
      refetchSettings();
    } catch (err) {
      setFreeShipping(!val);
      toast.error(t("Failed_to_update") || "Failed to update");
    }
  };

  if (settingsLoading) return <Loader />;

  return (
    <div
      className="p-6 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-300"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("Shipping_Settings") || "Shipping Settings"}
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {t("Manage_shipping_providers") ||
                "Manage your shipping providers"}
            </p>
          </div>
        </div>
      </div>

      {settingsError && !settingsError.includes("404") && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
          {t("Error_loading_data") || "Error loading data"}: {settingsError}
        </div>
      )}

      <div className="mb-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          {t("Active_Shipping_Method") || "Active Shipping Method"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleActiveMethodChange("self")}
            className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              activeMethod === "self"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-200 bg-white"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                activeMethod === "self"
                  ? "border-red-500 bg-red-500"
                  : "border-gray-300"
              }`}
            >
              {activeMethod === "self" && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <div className="text-start flex-1">
              <p className="font-bold text-gray-900 text-sm">
                {t("Self_Shipping") || "Self Shipping"}
              </p>
              <p className="text-xs text-gray-500">
                {t("Use_your_own_team") || "Use your own delivery team"}
              </p>
            </div>
          </button>

          <button
            onClick={() => handleActiveMethodChange("bosta")}
            className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              activeMethod === "bosta"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-200 bg-white"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                activeMethod === "bosta"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            >
              {activeMethod === "bosta" && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <div className="text-start flex-1">
              <p className="font-bold text-gray-900 text-sm">
                {t("Bosta_Shipping") || "Bosta Shipping"}
              </p>
              <p className="text-xs text-gray-500">
                {t("Integration_with_Bosta") || "Integration with Bosta"}
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <SelfCard
          form={selfForm}
          setForm={setSelfForm}
          onSave={handleSaveSelf}
          saving={savingSettings}
          onlineWarehouse={onlineWarehouse}
        />
        <BostaCard
          form={bostaForm}
          setForm={setBostaForm}
          onSave={handleSaveBosta}
          saving={savingSettings}
        />
        <AramexCard />
      </div>

      <FreeShippingCard
        enabled={freeShipping}
        onToggle={handleFreeShippingToggle}
        saving={savingSettings}
      />
    </div>
  );
};

export default Shipping;
