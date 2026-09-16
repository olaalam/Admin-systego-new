import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sparkles,
} from "lucide-react";

const EcommerceData = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/ecommerce-data");
  const navigate = useNavigate();
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/ecommerce-data",
  );
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [deleteTarget, setDeleteTarget] = useState(null);

  const items = data?.data?.data || data?.data || data?.users || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/ecommerce-data/${item._id || item.id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: isRTL ? "اسم الإعداد / المتجر" : "Store / Config Name",
      filterable: false,
      render: (_, item) => {
        const logo = item.header?.logo || item.footer?.logo || item.image;
        const title = item.header?.title || item.name || "Ecommerce Store";
        return (
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={title}
                className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white p-0.5 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                {title.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-900 block text-sm">
                {title}
              </span>
              <span className="text-xs text-gray-400 block">{item.name}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "announcement",
      header: isRTL ? "شريط الإعلانات (Header)" : "Announcement Bar",
      filterable: false,
      render: (_, item) => {
        const ann = item.header?.announcement;
        return ann ? (
          <div className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 max-w-[200px] truncate">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{ann}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      },
    },
    {
      key: "phone",
      header: isRTL ? "الهاتف" : "Phone",
      filterable: false,
      render: (_, item) => {
        const phone = item.header?.phone || item.footer?.phone || item.phone;
        return (
          <div
            className="flex items-center gap-1.5 text-gray-600 text-sm"
            dir="ltr"
          >
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{phone || "—"}</span>
          </div>
        );
      },
    },
    {
      key: "email",
      header: isRTL ? "البريد الإلكتروني" : "Email",
      filterable: false,
      render: (_, item) => {
        const email = item.header?.email || item.footer?.email || item.email;
        return (
          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[150px]">{email || "—"}</span>
          </div>
        );
      },
    },
    {
      key: "address",
      header: isRTL ? "العنوان" : "Address",
      filterable: false,
      render: (_, item) => {
        const address = item.address || item.footer?.address;
        return address ? (
          <div className="flex items-center gap-1.5 text-gray-600 text-xs max-w-[180px] truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      },
    },
    {
      key: "header_links",
      header: isRTL ? "روابط الهيدر" : "Header Links",
      filterable: false,
      render: (_, item) => {
        const links = item.header?.links || [];
        if (!links.length) {
          return <span className="text-gray-400 text-xs">—</span>;
        }
        return (
          <div className="flex items-center gap-1 flex-wrap max-w-[280px]">
            {links.slice(0, 5).map((link, idx) => {
              const text = typeof link === "string" ? link : link?.title || "";
              return (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize whitespace-nowrap shadow-2xs"
                >
                  {text}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("Status"),
      filterable: true,
      render: (value) => {
        const isActive = value === "active";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {isActive ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>{t("Active")}</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                <span>{t("Inactive")}</span>
              </>
            )}
          </span>
        );
      },
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={items}
        columns={columns}
        title={
          isRTL
            ? "إدارة بيانات المتجر (Header & Footer)"
            : "Ecommerce Data Management"
        }
        onAdd={() => navigate("add")}
        addButtonText={isRTL ? "إضافة بيانات جديدة" : "Add Ecommerce Data"}
        addPath="add"
        editPath={(item) => `edit/${item._id || item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onEdit={() => {}}
        itemsPerPage={10}
        searchable
        filterable
        moduleName="Ecommerce"
        filters={[
          {
            key: "status",
            label: t("Status"),
            options: [
              { label: t("Active"), value: "active" },
              { label: t("Inactive"), value: "inactive" },
            ],
          },
        ]}
      />

      {deleteTarget && (
        <DeleteDialog
          title={isRTL ? "حذف بيانات المتجر" : "Delete Ecommerce Data"}
          message={
            isRTL
              ? `هل أنت متأكد من حذف ${deleteTarget.name}؟`
              : `Are you sure you want to delete ${deleteTarget.name}?`
          }
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default EcommerceData;
