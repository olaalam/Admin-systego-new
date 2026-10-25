import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InstallmentPlanDetails from "./InstallmentPlanDetails";

const currency = (value) => Number(value || 0).toFixed(2);

const statusClass = (status) => {
  if (status === "completed" || status === "paid") {
    return "bg-green-100 text-green-700";
  }
  if (status === "cancelled") return "bg-gray-100 text-gray-600";
  if (status === "overdue") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

export default function Installments() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const statusLabel = (status) => {
    if (status === "completed") return t("installments.statuses.completed");
    if (status === "cancelled") return t("installments.statuses.cancelled");
    if (status === "active") return t("installments.statuses.active");
    if (status === "paid") return t("installments.statuses.paid");
    if (status === "overdue") return t("installments.statuses.overdue");
    return t("installments.statuses.pending");
  };

  const {
    data: settingsResponse,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useGet("/api/admin/installments/settings");

  const {
    data: plansResponse,
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useGet("/api/admin/installments/plans?limit=100");

  const { putData, loading: saving } = usePut();

  const [form, setForm] = useState({
    enabled: true,
    interest_type: "percentage",
    interest_value: 0,
    max_installments: 12,
    min_down_payment_percent: 0,
  });

  const [search, setSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    const settings = settingsResponse?.settings;
    if (!settings) return;

    setForm({
      enabled: settings.enabled !== false,
      interest_type: settings.interest_type || "percentage",
      interest_value: Number(settings.interest_value || 0),
      max_installments: Number(settings.max_installments || 12),
      min_down_payment_percent: Number(
        settings.min_down_payment_percent || 0,
      ),
    });
  }, [settingsResponse]);

  const plans = plansResponse?.plans || [];

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return plans;

    return plans.filter((plan) => {
      const name = String(plan.customer_id?.name || "").toLowerCase();
      const phone = String(plan.customer_id?.phone_number || "").toLowerCase();
      const number = String(plan.plan_number || "").toLowerCase();
      return (
        name.includes(keyword) ||
        phone.includes(keyword) ||
        number.includes(keyword)
      );
    });
  }, [plans, search]);

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      const res = await putData(form, "/api/admin/installments/settings");

      if (res?.success) {
        toast.success(t("installments.saved"));
        refetchSettings();
      } else {
        toast.error(res?.error?.message || t("installments.saveFailed"));
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.message ||
          t("installments.saveFailed"),
      );
    }
  };

  if (settingsLoading && !settingsResponse) return <Loader />;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {t("installments.title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("installments.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            id="installment-enabled"
            type="checkbox"
            checked={form.enabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, enabled: e.target.checked }))
            }
            className="w-4 h-4"
          />
          <label
            htmlFor="installment-enabled"
            className="text-sm font-medium text-gray-700"
          >
            {t("installments.enabled")}
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t("installments.interestType")}
          </label>
          <select
            value={form.interest_type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, interest_type: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="percentage">
              {t("installments.percentageOfFinanced")}
            </option>
            <option value="fixed">
              {t("installments.fixedPerInstallment")}
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t("installments.interestValue")}{" "}
            {form.interest_type === "percentage"
              ? t("installments.percentUnit")
              : t("installments.fixedUnit")}
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.interest_value}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                interest_value: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t("installments.maxInstallments")}
          </label>
          <Input
            type="number"
            min="1"
            max="60"
            value={form.max_installments}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                max_installments: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t("installments.minDownPayment")}
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={form.min_down_payment_percent}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                min_down_payment_percent: e.target.value,
              }))
            }
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? t("installments.saving") : t("installments.save")}
          </Button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {t("installments.plans")}
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("installments.searchPlaceholder")}
            className="w-full sm:w-72 text-sm border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {plansLoading && plans.length === 0 ? (
          <Loader />
        ) : filteredPlans.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {t("installments.noPlans")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`${
                    isArabic ? "text-right" : "text-left"
                  } text-gray-500 border-b`}
                >
                  <th className="py-2 px-2 font-medium">
                    {t("installments.planNumber")}
                  </th>
                  <th className="py-2 px-2 font-medium">
                    {t("installments.customer")}
                  </th>
                  <th className="py-2 px-2 font-medium">
                    {t("installments.source")}
                  </th>
                  <th className="py-2 px-2 font-medium">
                    {t("installments.total")}
                  </th>
                  <th className="py-2 px-2 font-medium">
                    {t("installments.paid")}
                  </th>
                  <th className="py-2 px-2 font-medium">
                    {t("installments.remaining")}
                  </th>
                  <th className="py-2 px-2 font-medium">
                    {t("installments.status")}
                  </th>
                  <th className="py-2 px-2 font-medium text-center">
                    {t("installments.details")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan._id}
                    onClick={() => setSelectedPlanId(plan._id)}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2 px-2 font-mono text-xs">
                      {plan.plan_number}
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-medium text-gray-800">
                        {plan.customer_id?.name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {plan.customer_id?.phone_number || ""}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      {plan.source === "pos"
                        ? "POS"
                        : t("installments.ecommerce")}
                    </td>
                    <td className="py-2 px-2">{currency(plan.total_payable)}</td>
                    <td className="py-2 px-2 text-teal-700">
                      {currency(
                        Number(plan.paid_amount || 0) +
                          Number(plan.down_payment || 0),
                      )}
                    </td>
                    <td className="py-2 px-2 font-semibold text-[#8B2635]">
                      {currency(plan.remaining_amount)}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(
                          plan.status,
                        )}`}
                      >
                        {statusLabel(plan.status)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedPlanId(plan._id);
                        }}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        title={t("installments.details")}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-3">
          <Button variant="outline" onClick={() => refetchPlans()}>
            {t("installments.refresh")}
          </Button>
        </div>
      </div>

      {selectedPlanId && (
        <InstallmentPlanDetails
          planId={selectedPlanId}
          onClose={() => setSelectedPlanId(null)}
          onChanged={() => refetchPlans()}
        />
      )}
    </div>
  );
}
