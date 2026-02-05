import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { Eye } from "lucide-react"; // أيقونة العين
import DataTable from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import ReturnDetailsModal from "./ReturnDetailsModal"; // استيراد المكون الجديد

export default function PurchaseReturnList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // States للمودال الخاص بإضافة مرجع
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reference, setReference] = useState("");

  // States للمودال الخاص بعرض التفاصيل
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // جلب قائمة المرتجعات
  const { data: response, loading: getLoading } = useGet("api/admin/return-purchase/all-returns");
  const { postData, loading: postLoading } = usePost();

  const columns = [
    {
      header: t("Date"),
      key: "date",
      render: (val) => new Date(val).toLocaleDateString()
    },
    { header: t("Reference"), key: "reference" },
    { header: t("Purchase Reference"), key: "purchase_reference" },
    {
      header: t("Supplier"),
      key: "supplier_id",
      render: (val) => val?.company_name || t("N/A")
    },
    { header: t("Total Amount"), key: "total_amount" },
    {
      header: t("Details"),
      key: "actions",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-700 rounded-full px-4"
          onClick={() => {
            setSelectedId(row._id);
            setIsDetailsOpen(true);
          }}
        >
          <Eye size={14} />
          {t("View")}
        </Button>
      )
    },
  ];

  const handleGoToCreate = async (e) => {
    e.preventDefault();
    if (!reference) return;

    const res = await postData(
      { reference: reference },
      "api/admin/return-purchase/purchase-for-return"
    );

    if (res?.success) {
      setIsModalOpen(false);
      navigate(`/purchase-return/add/${reference}`);
    }
  };

  return (
    <div className="p-6">
      <DataTable
        title={t("Purchase Return List")}
        data={response?.returns || []}
        columns={columns}
        addButtonText={t("Add Return")}
        onAdd={() => setIsModalOpen(true)}
        searchable={true}
        loading={getLoading}
        moduleName={AppModules.PURCHASE_RETURN}
      />

      {/* مودال إضافة مرتجع جديد بالـ Reference */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add Purchase Return")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGoToCreate} className="space-y-4">
            <p className="text-sm text-gray-500 italic">
              {t("The field labels marked with * are required input fields.")}
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Purchase Reference *")}</label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 01158665"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-purple-600 w-full text-white" disabled={postLoading}>
                {postLoading ? t("Checking...") : t("Submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* مودال عرض التفاصيل (يستدعى فقط عند الحاجة) */}
      {isDetailsOpen && (
        <ReturnDetailsModal
          id={selectedId}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}