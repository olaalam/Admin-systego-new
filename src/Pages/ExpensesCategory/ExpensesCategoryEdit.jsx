// src/pages/ExpenseCategoryEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function ExpenseCategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ✅ الـ endpoint الصحيح لتعديل ExpenseCategory
  const { putData, loading: updating } = usePut(`/api/admin/expenseCategory/${id}`);

  const [categoryData, setCategoryData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ الحقول الصحيحة للـ ExpenseCategory
  const fields = useMemo(
    () => [
      {
        key: "name",
    label: t("NameEnglish"),
        type: "text",
        required: true,
    placeholder: t("NameEnglishPlaceholder"),
      },
      {
        key: "ar_name",
    label: t("NameArabic"),
        type: "text",
        required: true,
    placeholder: t("NameArabicPlaceholder"),
      },
      {
        key: "status",
    label: t("ActiveStatus"),
        type: "switch",
        required: false,
      },
    ],
    []
  );

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/expenseCategory/${id}`);
        console.log("🔍 Full Response:", res.data);

        // ✅ استخراج الـ category الصحيح
        const category = res.data?.data?.expenseCategory || res.data?.data || null;

        if (!category) {
          toast.error("Expense category not found");
          navigate("/expense");
          return;
        }

        console.log("🎯 Extracted Category:", category);

        setCategoryData({
          name: category.name || "",
          ar_name: category.ar_name || "",
          status: category.status || false,
        });
      } catch (err) {
        console.error("❌ Error fetching expense category:", err);
        toast.error(t("Failed to load expense category data"));
        navigate("/expense");
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      console.log("📤 Submitting updated expense category:", formData);

      await putData(formData);

      toast.success(t("Expense category updated successfully"));
      navigate("/expense");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failedtoupdateexpensecategory");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((msg) => toast.error(msg));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => navigate("/expense");

  if (fetching) return <Loader />;

  if (!categoryData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">{t('Expensecategorynotfound')}</p>
        <button
          onClick={() => navigate("/expense")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-teal-700"
        >
          {t("BacktoExpenseCategories")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
       title={t("EditExpenseCategoryTitle", {
    name: categoryData.name || categoryData.ar_name || "..."
  })}
  description={t("EditExpenseCategoryDescription")}
  submitButtonText={t("UpdateExpenseCategory")}
        fields={fields}
        initialData={categoryData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
      />
    </div>
  );
}