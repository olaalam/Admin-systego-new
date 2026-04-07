// src/pages/payment_methods.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import {
  CreditCard,
  Settings,
  ShieldCheck,
  Info,
  Plus,
  Zap,
  MousePointer2,
  ChevronDown,
  Check
} from "lucide-react";

// --- مكوّن الكارت الخاص ببوابات الدفع (Automatic) المحدث ---
const GatewayCard = ({ title, endpoint, fields, paymentOptions, t }) => {
  // توليد الحالة الابتدائية ديناميكياً بناءً على الحقول
  const createInitialState = () => {
    const state = { isActive: false };
    fields.forEach(field => {
      state[field.key] = field.type === "checkbox" ? false : "";
    });
    return state;
  };

  const [formData, setFormData] = useState(createInitialState());
  const [loading, setLoading] = useState(false);

  // التحقق هل كل الحقول المطلوبة (required) تم ملؤها؟
  const isFormValid = fields
    .filter(f => f.required)
    .every(f => formData[f.key] && formData[f.key].toString().trim() !== "");

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      await api.post(endpoint, formData);
      toast.success(t("AddedSuccessfully"));
    } catch (error) {
      const serverMessage = error?.response?.data?.error?.message;
      toast.error(serverMessage || t("ErrorProcessingRequest"));
    } finally {
      // تفريغ الحقول في كل الحالات (نجاح أو فشل) بناءً على طلبك
      setFormData(createInitialState());
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-4 h-full group">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
            <Zap size={18} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-800 leading-none">{title}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Gateway</p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer scale-[0.8] origin-right">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!formData.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
          />
          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {fields.map((field) => {
            const isFullWidth = field.type === "select" || (field.key !== "api_key" && field.type !== "checkbox" && fields.length <= 4);

            return (
              <div key={field.key} className={`${isFullWidth ? "col-span-2" : "col-span-1"}`}>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      required={field.required}
                      className="w-full h-10 px-3 text-[11px] bg-slate-50/80 border-none rounded-xl focus:ring-1 focus:ring-primary/20 outline-none appearance-none text-slate-600 font-bold"
                      value={formData[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    >
                      <option value="">Select</option>
                      {paymentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-2 h-10 px-3 bg-slate-50/80 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-0 border-slate-300"
                      checked={!!formData[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.checked)}
                    />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{field.label}</span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full h-10 px-3 text-[11px] bg-slate-50/80 border-none rounded-xl focus:ring-1 focus:ring-primary/20 outline-none text-slate-600 font-bold placeholder:text-slate-300 transition-all"
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-6">
          <button
            type="submit"
            // الزرار معطل لو الفورم مش فاليد أو لو فيه تحميل
            disabled={!isFormValid || loading}
            className={`w-full h-11 rounded-2xl font-bold text-[11px] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-lg
              ${!isFormValid || loading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#0f172a] text-white hover:bg-primary active:scale-[0.98] shadow-slate-200"
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("Saving") || "Saving..."}
              </>
            ) : (
              <>
                <Check size={16} />
                {t("Save") || "Save"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
// --- الصفحة الرئيسية ---
const PaymentMethod = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const { data, loading, error, refetch } = useGet("/api/admin/payment_method");
  const { deleteData, loading: deleting } = useDelete("/api/admin/payment_method/delete");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { t } = useTranslation();

  const paymentMethods = data?.paymentMethods || [];
  const paymentOptions = paymentMethods.map((method) => ({
    label: method.name,
    value: method._id,
  }));

  const automaticGateways = [
    {
      title: "Paymob",
      endpoint: "/api/admin/paymob",
      fields: [
        { key: "payment_method_id", label: t("PaymentMethod"), type: "select", required: true },
        { key: "api_key", label: t("APIKey"), type: "text", required: true },
        { key: "iframe_id", label: t("IframeID"), type: "text", required: true },
        { key: "integration_id", label: t("IntegrationID"), type: "text", required: true },
        { key: "hmac_key", label: t("HMACKey"), type: "text", required: true },
        // { key: "type", label: t("Type"), type: "text", placeholder: "live or test" },
        { key: "callback", label: t("CallbackURL"), type: "text" },
        { key: "sandboxMode", label: t("SandboxMode"), type: "checkbox" },
      ],
    },
    {
      title: "Fawry",
      endpoint: "/api/admin/fawry",
      fields: [
        { key: "payment_method_id", label: t("PaymentMethod"), type: "select", required: true },
        { key: "merchantCode", label: t("MerchantCode"), type: "text", required: true },
        { key: "secureKey", label: t("SecureKey"), type: "text", required: true },
        { key: "sandboxMode", label: t("SandboxMode"), type: "checkbox" },
      ],
    },
    {
      title: "Geidea",
      endpoint: "/api/admin/geidea",
      fields: [
        { key: "payment_method_id", label: t("PaymentMethod"), type: "select", required: true },
        { key: "publicKey", label: t("PublicKey"), type: "text", required: true },
        { key: "apiPassword", label: t("APIPassword"), type: "text", required: true },
        { key: "merchantId", label: t("MerchantID"), type: "text", required: true },
        { key: "webhookSecret", label: t("WebhookSecret"), type: "text", required: true },
      ],
    },
  ];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/payment_method/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = !item.isActive;
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/payment_method/${item._id}`, { isActive: String(newStatus) });
      toast.success(t("Statusupdatedsuccessfully"));
      refetch();
    } catch (err) {
      toast.error(t("FailedToUpdateStatus"));
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderIcon = (url) => (
    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shadow-inner">
      {url ? (
        <img src={url} alt="Icon" className="w-full h-full object-contain" />
      ) : (
        <CreditCard size={20} className="text-slate-300" />
      )}
    </div>
  );

  const columns = [
    { key: "name", header: t("Name"), filterable: false },
    { key: "ar_name", header: t("ArabicName"), required: true },
    { key: "discription", header: t("Description"), filterable: false },
    {
      key: "isActive",
      header: t("Status"),
      filterable: false,
      render: (value, item) => (
        <label className="relative inline-flex items-center cursor-pointer scale-90">
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleStatusToggle(item)}
            disabled={updatingId === item._id}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-sm"></div>
          {updatingId === item._id && <div className="ml-2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </label>
      ),
    },
    { key: "icon", header: t("Icon"), filterable: false, render: renderIcon },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-10 bg-[#FBFBFF] min-h-screen">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <div className="p-3.5 bg-slate-900 text-white rounded-[1.25rem] shadow-2xl shadow-slate-200">
              <Settings size={28} />
            </div>
            {t("PaymentMethodManagement")}
          </h1>
          <p className="text-slate-400 mt-3 font-bold uppercase text-[11px] tracking-[0.2em] ml-1">{t("ManageMethodsSubtitle")}</p>
        </div>
      </div>

      {/* Segmented Tabs Control - تم تكبير الـ Padding هنا */}
      <div className="grid grid-cols-2 w-full p-2.5 bg-slate-100/80 backdrop-blur-md rounded-[2rem] mb-12 border border-slate-200/50 shadow-inner">
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-3 px-12 py-4 text-sm font-black rounded-[1.75rem] transition-all duration-500 ${activeTab === "manual"
            ? "bg-white text-slate-900 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] ring-1 ring-slate-200"
            : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
            }`}
        >
          <Plus size={18} className={activeTab === "manual" ? "text-primary" : ""} />
          {t("ManualMethods")}
        </button>
        <button
          onClick={() => setActiveTab("automatic")}
          className={`flex items-center gap-3 px-12 py-4 text-sm font-black rounded-[1.75rem] transition-all duration-500 ${activeTab === "automatic"
            ? "bg-white text-slate-900 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] ring-1 ring-slate-200"
            : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
            }`}
        >
          <Zap size={18} className={activeTab === "automatic" ? "text-yellow-500" : ""} />
          {t("AutomaticGateways")}
        </button>
      </div>

      {/* Tabs Content */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        {activeTab === "manual" ? (
          <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] border border-gray-100 p-6">
            <DataTable
              data={paymentMethods}
              columns={columns}
              title={t("PaymentMethods")}
              addButtonText={t("AddPaymentMethod")}
              onDelete={(item) => setDeleteTarget(item)}
              addPath="add"
              onAdd={() => setActiveTab("manual")}
              editPath={(item) => `edit/${item._id}`}
              onEdit={() => setActiveTab("manual")}
              itemsPerPage={10}
              searchable={true}
              filterable={true}
              moduleName={AppModules.PAYMENT_METHOD}
              filters={[
                {
                  key: "isActive",
                  label: t("Status"),
                  options: [
                    { label: t("Active"), value: "true" },
                    { label: t("Inactive"), value: "false" },
                  ],
                },
              ]}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {automaticGateways.map((gateway) => (
              <GatewayCard
                key={gateway.title}
                {...gateway}
                paymentOptions={paymentOptions}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeletePaymentMethod")}
          message={t("DeletePaymentMethodMessage", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default PaymentMethod;