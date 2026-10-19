import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import LocationPicker from "@/components/LocationPicker";

/**
 * Shared form for creating (from scratch) or editing a pickup point.
 * Set `showBranchSelect` to also allow linking/copying an existing branch.
 */
const PickupPointForm = ({
  title,
  description,
  initialData,
  onSubmit,
  onCancel,
  loading,
  showBranchSelect = false,
}) => {
  const { t } = useTranslation();
  const { data } = useGet("/api/admin/warehouse");
  const branches = data?.warehouses || [];

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: b.ar_name ? `${b.name} (${b.ar_name})` : b.name,
  }));

  const fields = useMemo(() => {
    const list = [];

    if (showBranchSelect) {
      list.push({
        key: "branch_id",
        label: t("Choose from Branch (optional)"),
        type: "select",
        options: branchOptions,
        placeholder: t("Create new (no branch)"),
        onChange: (value, setFormData) => {
          if (!value) {
            setFormData((prev) => ({ ...prev, branch_id: "" }));
            return;
          }
          const branch = branches.find((b) => b._id === value);
          if (!branch) return;
          // Copy the branch details; the pickup point stays linked to it.
          setFormData((prev) => ({
            ...prev,
            branch_id: value,
            name: branch.name || prev.name,
            ar_name: branch.ar_name || prev.ar_name,
            address: branch.address || prev.address,
            ar_address: branch.ar_address || prev.ar_address,
            phone: branch.phone || prev.phone,
          }));
        },
      });
    }

    list.push(
      { key: "name", label: `${t("Name")} (EN)`, required: true },
      { key: "ar_name", label: `${t("Name")} (AR)` },
      { key: "phone", label: t("Phone") },
      { key: "address", label: t("Address (English)") },
      { key: "ar_address", label: t("Address (Arabic)") },
      { key: "is_active", label: t("Active"), type: "checkbox" },
      {
        key: "map",
        label: t("Location on Map"),
        type: "custom",
        render: (formData, setFormData) => (
          <div className="space-y-3">
            <LocationPicker
              lat={formData.lat}
              lng={formData.lng}
              onChange={(lat, lng) =>
                setFormData((prev) => ({ ...prev, lat, lng }))
              }
              onAddress={(address) =>
                setFormData((prev) =>
                  prev.address ? prev : { ...prev, address },
                )
              }
            />
            <p className="text-xs text-gray-500">
              {t("Click on the map or drag the pin to set the pickup location.")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                placeholder={t("Latitude")}
                value={formData.lat ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lat: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <input
                type="number"
                step="any"
                placeholder={t("Longitude")}
                value={formData.lng ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lng: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        ),
      },
    );

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, branches, showBranchSelect]);

  return (
    <AddPage
      title={title}
      description={description}
      fields={fields}
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
    />
  );
};

export default PickupPointForm;
