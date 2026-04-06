// src/pages/ProductWarehouseEdit.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { useTranslation } from "react-i18next";

const ProductWarehouseEdit = () => {
    // ID سجل المخزون (Stock Record ID)
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const warehouseId = localStorage.getItem("currentWarehouseId") || "";

    const [fetching, setFetching] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const [productName, setProductName] = useState("");

    const { putData, loading: updating } = usePut(`/api/admin/product_warehouse/${id}`);

    useEffect(() => {
        const fetchCurrentData = async () => {
            setFetching(true);
            try {
                const res = await api.get(`/api/admin/product_warehouse/stock/${id}`);

                // ⭐️ التعديل هنا ليتناسب مع الريسبونس: الوصول لـ data.stock
                const record = res.data?.data?.stock;

                if (record) {
                    // تحديد اسم المنتج بناءً على اللغة من داخل productId
                    const pName = isArabic
                        ? (record.productId?.ar_name || record.productId?.name)
                        : record.productId?.name;

                    setProductName(pName || t("Unknown Product"));

                    // تهيئة الحقول بالبيانات الحالية من الـ record
                    setInitialData({
                        quantity: record.quantity || 0,
                        low_stock: record.low_stock || 0,
                    });
                }
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error(t("Failed to fetch inventory data"));
            } finally {
                setFetching(false);
            }
        };

        if (id) fetchCurrentData();
    }, [id, t, isArabic]);

    const fields = useMemo(() => [
        {
            key: "product_name_display",
            label: t("Product"),
            type: "text",
            disabled: true, // للقراءة فقط
            // نستخدم القيمة المباشرة للاسم في الـ initialValue لاحقاً أو كـ placeholder
        },
        {
            key: "quantity",
            label: t("Quantity"),
            type: "number",
            required: true
        },
        {
            key: "low_stock",
            label: t("Low Stock Alert"),
            type: "number",
            required: true
        },
    ], [t]);

    const handleSubmit = async (formData) => {
        try {
            const payload = {
                quantity: Number(formData.quantity),
                low_stock: Number(formData.low_stock),
            };

            await putData(payload);
            toast.success(t("Inventory updated successfully"));

            if (warehouseId) {
                navigate(`/product-warehouse/${warehouseId}`);
            } else {
                navigate(-1);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("Failed to update inventory"));
        }
    };

    if (fetching) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {initialData && (
                <AddPage
                    title={t("Edit Inventory Product")}
                    description={`${t("Updating stock for")}: ${productName}`}
                    fields={fields}
                    onSubmit={handleSubmit}
                    onCancel={() => warehouseId ? navigate(`/product-warehouse/${warehouseId}`) : navigate(-1)}
                    // ندمج اسم المنتج في البيانات الأولية ليظهر في الحقل المعطل
                    initialData={{
                        ...initialData,
                        product_name_display: productName
                    }}
                    loading={updating}
                />
            )}
        </div>
    );
};

export default ProductWarehouseEdit;