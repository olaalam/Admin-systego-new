import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Pencil,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import api from "@/api/api";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppModules } from "@/config/modules";
import { hasAnyPermission } from "@/lib/checkPermission";

const currency = (value) => Number(value || 0).toFixed(2);

const statusClass = (status) => {
  if (status === "completed" || status === "paid") {
    return "bg-green-100 text-green-700";
  }
  if (status === "cancelled") return "bg-gray-100 text-gray-600";
  if (status === "overdue") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const sourceClass = (source) =>
  source === "pos"
    ? "bg-sky-100 text-sky-700"
    : "bg-purple-100 text-purple-700";

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const SummaryCard = ({ label, value, tone = "text-gray-800" }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
    <p className="text-[11px] text-gray-500">{label}</p>
    <p className={`text-sm font-bold ${tone}`}>{currency(value)}</p>
  </div>
);

export default function InstallmentPlanDetails({ planId, onClose, onChanged }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigate = useNavigate();

  // 🔐 صلاحيات تعديل/إلغاء خطة الأقساط
  const canEditPlan = hasAnyPermission([AppModules.INSTALLMENTS, AppModules.ADMIN, AppModules.POS], "edit");
  const canDeletePlan = hasAnyPermission([AppModules.INSTALLMENTS, AppModules.ADMIN, AppModules.POS], "delete");

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collectItem, setCollectItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [collectForm, setCollectForm] = useState({
    amount: "",
    account_id: "",
    note: "",
  });
  const [editForm, setEditForm] = useState({ amount: "", due_date: "" });
  const [busy, setBusy] = useState(false);

  const { data: accountsResponse } = useGet("/api/admin/bank_account");
  const { putData } = usePut();

  const statusLabel = (status) => {
    if (status === "completed") return t("installments.statuses.completed");
    if (status === "cancelled") return t("installments.statuses.cancelled");
    if (status === "active") return t("installments.statuses.active");
    if (status === "paid") return t("installments.statuses.paid");
    if (status === "overdue") return t("installments.statuses.overdue");
    return t("installments.statuses.pending");
  };

  const fetchPlan = async () => {
    if (!planId) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/admin/installments/plans/${planId}`);
      if (res.data?.success) {
        setPlan(res.data.data.plan);
      } else {
        toast.error(
          res.data?.error?.message || t("installments.detailsLoadFailed"),
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.message ||
          t("installments.detailsLoadFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const planWarehouseId =
    plan?.warehouse_id?._id || plan?.warehouse_id || null;

  const accounts = useMemo(() => {
    if (!planWarehouseId) return [];

    return (accountsResponse?.bankAccounts || []).filter((account) => {
      const ids = Array.isArray(account.warehouseId)
        ? account.warehouseId
        : [account.warehouseId];

      const belongsToBranch = ids.some(
        (id) => String(id?._id || id) === String(planWarehouseId),
      );

      return (
        belongsToBranch &&
        account.status !== false &&
        account.in_POS === true
      );
    });
  }, [accountsResponse, planWarehouseId]);

  const totalPaid = useMemo(
    () =>
      Number(plan?.paid_amount || 0) + Number(plan?.down_payment || 0),
    [plan],
  );

  useEffect(() => {
    if (collectItem && !collectForm.account_id && accounts.length > 0) {
      setCollectForm((prev) => ({
        ...prev,
        account_id: accounts[0]._id,
      }));
    }
  }, [accounts, collectItem, collectForm.account_id]);

  const openCollect = (item) => {
    const remaining = Number(
      item.remaining_amount ??
        Number(item.amount || 0) - Number(item.paid_amount || 0),
    );

    setEditItem(null);
    setCollectItem(item);
    setCollectForm({
      amount: String(remaining > 0 ? remaining : ""),
      account_id: accounts[0]?._id || "",
      note: "",
    });
  };

  const openEdit = (item) => {
    setCollectItem(null);
    setEditItem(item);
    setEditForm({
      amount: String(item.amount ?? ""),
      due_date: toDateInput(item.due_date),
    });
  };

  const refreshAfterAction = async () => {
    await fetchPlan();
    onChanged?.();
  };

  const submitCollect = async () => {
    const amount = Number(collectForm.amount);

    if (!amount || amount <= 0) {
      toast.error(t("installments.invalidAmount"));
      return;
    }
    if (!collectForm.account_id) {
      toast.error(t("installments.chooseAccount"));
      return;
    }

    try {
      setBusy(true);
      const res = await putData(
        {
          amount,
          financials: [{ account_id: collectForm.account_id, amount }],
          note: collectForm.note,
        },
        `/api/admin/installments/plans/${planId}/items/${collectItem._id}/pay`,
      );

      if (res?.success) {
        toast.success(t("installments.collected"));
        setCollectItem(null);
        await refreshAfterAction();
      } else {
        toast.error(
          res?.error?.message || t("installments.actionFailed"),
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.message ||
          t("installments.actionFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async () => {
    const amount = Number(editForm.amount);

    if (!amount || amount <= 0) {
      toast.error(t("installments.invalidAmount"));
      return;
    }
    if (!editForm.due_date) {
      toast.error(t("installments.invalidDate"));
      return;
    }

    try {
      setBusy(true);
      const res = await putData(
        { amount, due_date: editForm.due_date },
        `/api/admin/installments/plans/${planId}/items/${editItem._id}`,
      );

      if (res?.success) {
        toast.success(t("installments.updated"));
        setEditItem(null);
        await refreshAfterAction();
      } else {
        toast.error(
          res?.error?.message || t("installments.actionFailed"),
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.message ||
          t("installments.actionFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelPlan = async () => {
    if (!window.confirm(t("installments.confirmCancel"))) return;

    try {
      setBusy(true);
      const res = await putData(
        {},
        `/api/admin/installments/plans/${planId}/cancel`,
      );

      if (res?.success) {
        toast.success(t("installments.cancelled"));
        await refreshAfterAction();
      } else {
        toast.error(
          res?.error?.message || t("installments.actionFailed"),
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.message ||
          t("installments.actionFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  if (!planId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4 rounded-t-2xl">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">
                {t("installments.planDetails")}
              </h2>
              {plan?.plan_number && (
                <span className="font-mono text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                  {plan.plan_number}
                </span>
              )}
              {plan?.source && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${sourceClass(
                    plan.source,
                  )}`}
                >
                  {plan.source === "pos"
                    ? "POS"
                    : t("installments.ecommerce")}
                </span>
              )}
              {plan?.status && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClass(
                    plan.status,
                  )}`}
                >
                  {statusLabel(plan.status)}
                </span>
              )}
            </div>
            {plan?.order_reference && (
              <p className="mt-1 text-xs text-gray-500">
                {t("installments.orderReference")}: {plan.order_reference}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="close"
          >
            <X size={18} />
          </button>
        </div>

        {loading && !plan ? (
          <div className="p-10">
            <Loader />
          </div>
        ) : !plan ? (
          <div className="p-10 text-center text-gray-500">
            {t("installments.detailsLoadFailed")}
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Customer / branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-[11px] text-gray-500">
                  {t("installments.customer")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {plan.customer_id?.name || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {plan.customer_id?.phone_number || ""}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-[11px] text-gray-500">
                  {t("installments.branch")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {plan.warehouse_id?.name || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-[11px] text-gray-500">
                  {t("installments.startDate")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(plan.start_date)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-[11px] text-gray-500">
                  {t("installments.createdAt")}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(plan.createdAt)}
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard
                label={t("installments.orderTotal")}
                value={plan.order_total}
              />
              <SummaryCard
                label={t("installments.downPayment")}
                value={plan.down_payment}
              />
              <SummaryCard
                label={t("installments.interest")}
                value={plan.interest_amount}
              />
              <SummaryCard
                label={t("installments.total")}
                value={plan.total_payable}
              />
              <SummaryCard
                label={t("installments.paid")}
                value={totalPaid}
                tone="text-teal-700"
              />
              <SummaryCard
                label={t("installments.remaining")}
                value={plan.remaining_amount}
                tone="text-[#8B2635]"
              />
            </div>

            {/* Collect form */}
            {collectItem && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-teal-800">
                  <Wallet size={16} />
                  <h3 className="text-sm font-bold">
                    {t("installments.collectTitle")} #{collectItem.sequence}
                  </h3>
                </div>

                {accounts.length === 0 ? (
                  <>
                    <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-800">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold">
                          {t("installments.noAccounts")}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/accounting")}
                          className="mt-1 font-bold underline"
                        >
                          {t("installments.goToAccounting")}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCollectItem(null)}
                      >
                        {t("installments.cancel")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          {t("installments.amount")}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={collectItem.remaining_amount}
                          step="0.01"
                          value={collectForm.amount}
                          onChange={(event) =>
                            setCollectForm((prev) => ({
                              ...prev,
                              amount: event.target.value,
                            }))
                          }
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          {t("installments.remaining")}:{" "}
                          {currency(collectItem.remaining_amount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          {t("installments.account")}
                        </label>
                        <select
                          value={collectForm.account_id}
                          onChange={(event) =>
                            setCollectForm((prev) => ({
                              ...prev,
                              account_id: event.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        >
                          <option value="">
                            {t("installments.chooseAccount")}
                          </option>
                          {accounts.map((account) => (
                            <option key={account._id} value={account._id}>
                              {isArabic
                                ? account.ar_name || account.name
                                : account.name || account.ar_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          {t("installments.note")}
                        </label>
                        <Input
                          value={collectForm.note}
                          onChange={(event) =>
                            setCollectForm((prev) => ({
                              ...prev,
                              note: event.target.value,
                            }))
                          }
                          placeholder={t("installments.notePlaceholder")}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCollectItem(null)}
                        disabled={busy}
                      >
                        {t("installments.cancel")}
                      </Button>
                      <Button
                        type="button"
                        onClick={submitCollect}
                        disabled={busy}
                      >
                        {busy
                          ? t("installments.saving")
                          : t("installments.collect")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Edit form */}
            {editItem && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Pencil size={16} />
                  <h3 className="text-sm font-bold">
                    {t("installments.editTitle")} #{editItem.sequence}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      {t("installments.amount")}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          amount: event.target.value,
                        }))
                      }
                    />
                    {Number(editItem.paid_amount || 0) > 0 && (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {t("installments.alreadyPaid")}:{" "}
                        {currency(editItem.paid_amount)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      {t("installments.dueDate")}
                    </label>
                    <Input
                      type="date"
                      value={editForm.due_date}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          due_date: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditItem(null)}
                    disabled={busy}
                  >
                    {t("installments.cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={submitEdit}
                    disabled={busy}
                  >
                    {busy
                      ? t("installments.saving")
                      : t("installments.saveChanges")}
                  </Button>
                </div>
              </div>
            )}

            {/* Installments */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">
                  {t("installments.schedule")}
                </h3>
                <span className="text-xs text-gray-500">
                  {t("installments.installmentsCount")}:{" "}
                  {plan.installments?.length || plan.installments_count || 0}
                </span>
              </div>

              {!plan.installments?.length ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  {t("installments.noInstallments")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`${
                          isArabic ? "text-right" : "text-left"
                        } text-gray-500 border-b bg-white`}
                      >
                        <th className="py-2 px-3 font-medium">#</th>
                        <th className="py-2 px-3 font-medium">
                          {t("installments.dueDate")}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {t("installments.amount")}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {t("installments.paid")}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {t("installments.remaining")}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {t("installments.status")}
                        </th>
                        <th className="py-2 px-3 font-medium text-center">
                          {t("installments.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.installments.map((item) => {
                        const remaining = Number(
                          item.remaining_amount ??
                            Number(item.amount || 0) -
                              Number(item.paid_amount || 0),
                        );
                        const isCancelled = item.status === "cancelled";
                        const isPaid = item.status === "paid";
                        const canCollect =
                          canEditPlan &&
                          plan.status !== "cancelled" &&
                          !isCancelled &&
                          !isPaid &&
                          remaining > 0;

                        return (
                          <tr
                            key={item._id}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >
                            <td className="py-2 px-3 font-mono text-xs">
                              {item.sequence}
                            </td>
                            <td className="py-2 px-3">
                              {formatDate(item.due_date)}
                            </td>
                            <td className="py-2 px-3">
                              {currency(item.amount)}
                            </td>
                            <td className="py-2 px-3 text-teal-700">
                              {currency(item.paid_amount)}
                            </td>
                            <td className="py-2 px-3 font-semibold text-[#8B2635]">
                              {currency(remaining)}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(
                                  item.status,
                                )}`}
                              >
                                {statusLabel(item.status)}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center justify-center gap-1">
                                {canCollect && (
                                  <button
                                    type="button"
                                    onClick={() => openCollect(item)}
                                    className="rounded-lg p-1.5 text-teal-700 hover:bg-teal-50"
                                    title={t("installments.collect")}
                                  >
                                    <Wallet size={16} />
                                  </button>
                                )}
                                {canEditPlan &&
                                  !isCancelled &&
                                  plan.status !== "cancelled" && (
                                    <button
                                      type="button"
                                      onClick={() => openEdit(item)}
                                      className="rounded-lg p-1.5 text-blue-700 hover:bg-blue-50"
                                      title={t("installments.edit")}
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  )}
                                {isPaid && (
                                  <CheckCircle2
                                    size={16}
                                    className="text-green-600"
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {plan.status === "active" && canDeletePlan && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelPlan}
                    disabled={busy}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Ban size={15} className="me-1" />
                    {t("installments.cancelPlan")}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchPlan}
                  disabled={loading}
                >
                  <RefreshCw size={15} className="me-1" />
                  {t("installments.refresh")}
                </Button>
                <Button type="button" onClick={onClose}>
                  {t("installments.close")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
