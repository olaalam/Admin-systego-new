import { useState } from "react";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Edit, Phone, Mail, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  returned: "bg-red-100 text-red-800",
  partially_returned: "bg-orange-100 text-orange-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  failed_to_deliver: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  scheduled: "bg-cyan-100 text-cyan-800",
};

const Customer = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGet(
    "/api/admin/customer/with-orders",
  );
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/customer/delete",
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [ordersCustomer, setOrdersCustomer] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const customers = data?.customers || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/customer/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingcustomers")}: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("customer_management")}
        </h1>
        <Button onClick={() => navigate("add")}>{t("add_customer")}</Button>
      </div>

      {customers.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          {isRTL ? "لا يوجد عملاء" : "No customers"}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {customers.map((c) => {
          const orders = c.orders || [];
          const statusCounts = c.statusCounts || {};
          return (
            <div
              key={c._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col"
            >
              {/* header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2
                    className="text-lg font-semibold text-primary hover:underline cursor-pointer"
                    onClick={() => navigate(`/customer/details/${c._id}`)}
                  >
                    {c.name}
                  </h2>
                  {c.customer_group_id?.name || c.customer_group ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mt-1">
                      {c.customer_group_id?.name || c.customer_group}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setOrdersCustomer(c)}
                    className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                    title={isRTL ? "عرض الطلبات" : "View orders"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`edit/${c._id}`)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                    title={t("edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* contact info */}
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </div>
                )}
                {c.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {c.phone_number}
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> {c.address}
                  </div>
                )}
              </div>

              {/* due / points */}
              <div className="flex items-center justify-between text-sm mb-3">
                <span>
                  {t("has_due")}:{" "}
                  {c.is_Due ? (
                    <span className="text-red-600 font-semibold">
                      {t("yes")}
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      {t("no")}
                    </span>
                  )}
                </span>
                <span>
                  {t("amount_due")}: <strong>{c.amount_Due || 0}</strong>
                </span>
                <span>
                  {t("points")}: <strong>{c.total_points_earned || 0}</strong>
                </span>
              </div>

              {/* status counts + pending total */}
              <div className="border-t pt-3 mt-auto">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Object.keys(statusCounts).length === 0 && (
                    <span className="text-gray-400 text-xs">
                      {isRTL ? "لا توجد طلبات" : "No orders"}
                    </span>
                  )}
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <Badge
                      key={status}
                      className={
                        STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {status}: {count}
                    </Badge>
                  ))}
                  {orders.length > 0 && (
                    <Badge className="bg-gray-200 text-gray-800">
                      {isRTL ? "الإجمالي" : "Total"}: {orders.length}
                    </Badge>
                  )}
                </div>

                {/* orders list (compact) */}
                {orders.length > 0 && (
                  <div className="mt-3 max-h-48 overflow-auto space-y-1">
                    {orders.slice(0, 5).map((o) => (
                      <div
                        key={o._id}
                        className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
                      >
                        <span className="font-mono">{o.reference}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            STATUS_COLORS[o.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {o.status}
                        </span>
                        <span className="font-semibold">{o.total ?? "-"}</span>
                      </div>
                    ))}
                    {orders.length > 5 && (
                      <div className="text-xs text-gray-400 text-center">
                        +{orders.length - 5} {isRTL ? "المزيد..." : "more..."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <DeleteDialog
          title={t("delete_customer_title")}
          message={t("confirm_delete_customer", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <Dialog
        open={!!ordersCustomer}
        onOpenChange={(o) => !o && setOrdersCustomer(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "طلبات العميل" : "Customer Orders"} —{" "}
              {ordersCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? "جميع الطلبات حسب الحالة"
                : "All orders grouped by status"}
            </DialogDescription>
          </DialogHeader>

          {!ordersCustomer ? null : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(ordersCustomer.statusCounts || {}).length ===
                  0 && (
                  <span className="text-gray-400 text-sm">
                    {isRTL ? "لا توجد طلبات" : "No orders"}
                  </span>
                )}
                {Object.entries(ordersCustomer.statusCounts || {}).map(
                  ([status, count]) => (
                    <Badge
                      key={status}
                      className={
                        STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {status}: {count} (
                      {(ordersCustomer.statusTotals || {})[status] || 0})
                    </Badge>
                  ),
                )}
                {(ordersCustomer.orders || []).length > 0 && (
                  <Badge className="bg-gray-200 text-gray-800">
                    {isRTL ? "الإجمالي" : "Total"}:{" "}
                    {(ordersCustomer.orders || []).length}
                  </Badge>
                )}
                {/* pending total removed per user request */}
              </div>

              {(ordersCustomer.orders || []).length > 0 && (
                <div className="max-h-96 overflow-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          {isRTL ? "المرجع" : "Reference"}
                        </th>
                        <th className="px-3 py-2 text-left">
                          {isRTL ? "المصدر" : "Source"}
                        </th>
                        <th className="px-3 py-2 text-left">
                          {isRTL ? "الحالة" : "Status"}
                        </th>
                        <th className="px-3 py-2 text-right">
                          {isRTL ? "المجموع" : "Total"}
                        </th>
                        <th className="px-3 py-2 text-left">
                          {isRTL ? "التاريخ" : "Date"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ordersCustomer.orders || []).map((o) => (
                        <tr key={o._id} className="border-t">
                          <td className="px-3 py-2 font-mono text-xs">
                            {o.reference}
                          </td>
                          <td className="px-3 py-2">{o.source}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                STATUS_COLORS[o.status] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {o.total ?? "-"}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {o.date ? new Date(o.date).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customer;
