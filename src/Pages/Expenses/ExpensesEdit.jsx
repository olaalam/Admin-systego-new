import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function ExpensesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEdit = Boolean(id);

  const { putData, loading: updating } = usePut(
    isEdit ? `/api/admin/expenseAdmin/${id}` : null
  );
  const { postData, loading: creating } = usePost("/api/admin/expenseAdmin");

  const { data: selectionData, loading: loadingSelections } =
    useGet("/api/admin/expenseAdmin/selection");

  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(isEdit);

  /* =========================
     Select Options
  ========================= */
  const categoryOptions =
    selectionData?.expensecategory?.map((cat) => ({
      label: `${cat.name} - ${cat.ar_name}`,
      value: cat._id,
    })) || [];

  const accountOptions =
    selectionData?.financial_account?.map((acc) => ({
      label: acc.name,
      value: acc._id,
    })) || [];

  /* =========================
     Form Fields
  ========================= */
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("ExpenseName"),
        type: "text",
        required: true,
        placeholder: t("ExpenseNamePlaceholder"),
      },
      {
        key: "amount",
        label: t("Amount"),
        type: "number",
        required: true,
        placeholder: t("AmountPlaceholder"),
      },
      {
        key: "Category_id",
        label: t("Category"),
        type: "select",
        required: true,
        options: categoryOptions,
        placeholder: t("SelectCategory"),
      },
      {
        key: "financial_accountId",
        label: t("FinancialAccount"),
        type: "select",
        required: true,
        options: accountOptions,
        placeholder: t("SelectAccount"),
      },
      {
        key: "note",
        label: t("Note"),
        type: "textarea",
        required: false,
        placeholder: t("NotePlaceholder"),
      },
    ],
    [categoryOptions, accountOptions]
  );

  /* =========================
     Fetch Expense (Edit)
  ========================= */
  useEffect(() => {
    const fetchExpense = async () => {
      if (!isEdit) return;

      try {
        const res = await api.get(`/api/admin/expenseAdmin/${id}`);
        const expense = res.data?.data?.expense;

        if (!expense) {
          toast.error(t("expensenotfound"));
          navigate("/expense");
          return;
        }

        setInitialData({
          name: expense.name || "",
          amount: expense.amount || "",
          Category_id: expense.Category_id?._id || "",
          financial_accountId: expense.financial_accountId?._id || "",
          note: expense.note || "",
        });
      } catch (err) {
        toast.error(t("Failed to load expense data"),err);
        navigate("/expense");
      } finally {
        setFetching(false);
      }
    };

   fetchExpense();
  }, [id, isEdit, navigate]);

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        amount: Number(formData.amount),
        Category_id: formData.Category_id,
        financial_accountId: formData.financial_accountId,
        note: formData.note,
      };

      if (isEdit) {
        await putData(payload);
        toast.success(t("expenseupdatedsuccessfully"));
      } else {
        await postData(payload);
        toast.success(t("expenseaddedsuccessfully"));
      }

      navigate("/expense");
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleCancel = () => navigate("/expense");

  if (fetching || loadingSelections) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={isEdit ? t("EditExpense") : t("AddExpense")}
  description={t("FillExpenseDetails")}
  submitButtonText={isEdit ? t("UpdateExpense") : t("CreateExpense")}
        fields={fields}
        initialData={
          initialData || {
            name: "",
            amount: "",
            Category_id: "",
            financial_accountId: "",
            note: "",
          }
        }
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating || creating}
      />
    </div>
  );
}
