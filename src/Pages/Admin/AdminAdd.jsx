// src/pages/AdminAdd.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";

const AdminAdd = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const { postData, loading: submitting } = usePost("/api/admin/admin");
const { data: selectionData } = useGet("/api/admin/admin/selection");

const warehouseOptions = selectionData?.warehouses?.map(w => ({ label: w.name, value: w.id })) || [];
const roleOptions = selectionData?.roles?.map(r => ({ label: r.name, value: r.id })) || [];

  /* =======================
     Form Fields
  ======================= */
const fields = useMemo(
  () => [
    {
      key: "username",
      label: t("username"),
      type: "text",
      required: true,
    },
    {
      key: "email",
      label: t("Email"),
      type: "email",
      required: true,
    },
    {
      key: "password",
      label: t("password"),
      type: "password",
      required: true,
    },
    {
      key: "company_name",
      label: t("companyName"),
      type: "text",
      required: true,
    },
    {
      key: "phone",
      label: t("phone"),
      type: "text",
      required: true,
    },
    {
      key: "role_id",
      label: t("Role"),
      type: "select",
      required: true,
 options: roleOptions,
    },
    {
      key: "warehouse_id",
      label: t("Warehouse"),
      type: "select",
      required: true,
      options: warehouseOptions,
    },
  ],
  [warehouseOptions]
);


  /* =======================
     Submit
  ======================= */
const handleSubmit = async (formData) => {
  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      company_name: formData.company_name,
      role_id: formData.role_id,       // ✅ صح
      warehouse_id: formData.warehouse_id,
      status: "active",                // ✅ مهم
    };

    await postData(payload);

    toast.success(t("Adminaddedsuccessfully"));
    navigate("/admin");
  } catch (err) {
    toast.error(
      err.response?.data?.message || t("Failedtoddadmin")
    );
  }
};



  return (
    <div className="p-6">
      <AddPage
     title={t("AddAdmin")}
  description={t("AddAdminDescription")}
   fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin")}
        loading={submitting}
      />
    </div>
  );
};

export default AdminAdd;
