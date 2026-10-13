// src/pages/BankAccountEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";

export default function BankAccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { putData, loading: updating } = usePut(
    `/api/admin/bank_account/${id}`,
  );

  const [bankAccountData, setBankAccountData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const {
    data: warehouseData,
    loading: loadingWarehouses,
    error: warehouseError,
  } = useGet("/api/admin/bank_account/select-warehouses");

  const warehouses =
    warehouseData?.warehouses?.map((w) => ({
      label: w.name,
      value: w._id,
    })) || [];

  const fields = useMemo(
    () => [
      // ⭐️ حقل الاسم بالعربية
      {
        key: "ar_name",
        label: isRTL ? "الاسم (بالعربية)" : "Name (Arabic)",
        type: "text",
        required: true,
      },
      {
        key: "name",
        label: t("BankName"),
        type: "text",
        required: true,
      },
      {
        key: "warehouseId",
        label: t("Warehouse"),
        type: "select",
        required: true,
        options: warehouses,
      },
      {
        key: "balance",
        label: t("InitialBalance"),
        type: "number",
        required: true,
        min: 0,
        step: "0.01",
      },
      {
        key: "description",
        label: t("Description"),
        type: "textarea",
      },
      {
        key: "image",
        label: t("Image"),
        type: "image",
      },
      {
        key: "status",
        label: t("Active"),
        type: "switch",
      },
      {
        key: "in_POS",
        label: t("AvailableinPOS"),
        type: "switch",
      },
    ],
    [warehouses, isRTL, t],
  );

  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const res = await api.get(`/api/admin/bank_account/${id}`);
        const bankAccount = res.data?.data?.bankAccount;

        if (!bankAccount) {
          toast.error("Bank account not found");
          navigate("/accounting");
          return;
        }

        setBankAccountData({
          // ⭐️ جلب ar_name من الاستجابة
          ar_name: bankAccount.ar_name || "",
          name: bankAccount.name || "",
          warehouseId: Array.isArray(bankAccount.warehouseId)
            ? bankAccount.warehouseId.map((w) => w._id)
            : bankAccount.warehouseId?._id
              ? [bankAccount.warehouseId._id]
              : [],
          balance: bankAccount.balance || 0,
          description: bankAccount.description || "",
          // ⭐️ string فارغ بدلاً من null
          image: bankAccount.image || "",
          status: Boolean(bankAccount.status),
          in_POS: Boolean(bankAccount.in_POS),
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bank account data");
        navigate("/accounting");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchBankAccount();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        // ⭐️ إرسال ar_name
        ar_name: formData.ar_name || "",
        name: formData.name || "",
        warehouseId: Array.isArray(formData.warehouseId)
          ? formData.warehouseId
          : [formData.warehouseId],
        balance: String(formData.balance),
        description: formData.description || "",
        status: Boolean(formData.status),
        in_POS: Boolean(formData.in_POS),
      };

      // ✅ لو الصورة URL قديمة → ما نبعتهاش
      if (
        typeof formData.image === "string" &&
        formData.image === bankAccountData?.image
      ) {
        // لا نضيف image للـ payload
      } else {
        // ⭐️ إرسال string فارغ بدلاً من null
        payload.image = formData.image || "";
      }

      console.log("📤 Updating payload:", payload);

      await putData(payload);

      toast.success("Bank account updated successfully!");
      navigate("/accounting");
    } catch (err) {
      console.error(err);

      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update bank account";

      const errorDetails = err.response?.data?.error?.details;

      if (Array.isArray(errorDetails)) {
        errorDetails.forEach((d) => toast.error(d));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => navigate("/accounting");

  if (fetching || loadingWarehouses) return <Loader />;

  if (warehouseError) {
    return (
      <div className="p-6 text-center text-red-600">
        {t("Failedtoloadwarehouses")}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={`${t("Edit Bank Account")}: ${bankAccountData.name}`}
        description={t("Update the details of this bank account")}
        fields={fields}
        initialData={bankAccountData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
        submitButtonText={t("UpdateAccount")}
      />
    </div>
  );
}
