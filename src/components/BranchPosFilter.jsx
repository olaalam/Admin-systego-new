import React from "react";
import { useTranslation } from "react-i18next";

const normalizeId = (value) =>
  value && typeof value === "object" ? value._id : value;

const DEFAULT_SELECT_CLASS =
  "bg-transparent text-sm font-medium focus:outline-none px-2 py-1 cursor-pointer";

/**
 * فلتر مشترك: الفروع (Warehouse) + نقاط البيع (POS = Cashier)
 *
 * <BranchPosFilter
 *   value={{ warehouse_id, cashier_id }}
 *   onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
 *   warehouses={warehouses}
 *   cashiers={cashiers}
 * />
 */
export default function BranchPosFilter({
  value = {},
  onChange,
  warehouses = [],
  cashiers = [],
  showPos = true,
  selectClassName = DEFAULT_SELECT_CLASS,
}) {
  const { t } = useTranslation();

  const branchId = normalizeId(value.warehouse_id) || "";
  const cashierId = normalizeId(value.cashier_id) || "";

  // نعرض بس نقاط البيع التابعة للفرع المختار
  const filteredCashiers = cashiers.filter((cashier) => {
    if (!branchId) return true;
    return String(normalizeId(cashier.warehouse_id)) === String(branchId);
  });

  return (
    <>
      <select
        aria-label={t("Warehouse")}
        value={branchId}
        onChange={(e) =>
          onChange({ warehouse_id: e.target.value, cashier_id: "" })
        }
        className={selectClassName}
      >
        <option value="">{t("All Warehouses")}</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse._id} value={warehouse._id}>
            {warehouse.name}
          </option>
        ))}
      </select>

      {showPos && (
        <select
          aria-label={t("POS Cashier")}
          value={cashierId}
          onChange={(e) => onChange({ cashier_id: e.target.value })}
          className={selectClassName}
          disabled={cashiers.length === 0}
        >
          <option value="">{t("All Cashiers")}</option>
          {filteredCashiers.map((cashier) => (
            <option key={cashier._id} value={cashier._id}>
              {cashier.name}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
