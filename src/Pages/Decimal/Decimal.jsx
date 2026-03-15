import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Settings2, Edit, Hash, Calendar, Fingerprint, Clock, Activity } from "lucide-react";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";

const Decimal = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [decimalData, setDecimalData] = useState(null);

    // 1. جلب البيانات (View Mode)
    const { data, isLoading, refetch } = useGet("/api/admin/decimal-setting");

    // 2. هوك التعديل (Edit Mode)
    // نستخدم 'updating' كحالة تحميل خاصة بعملية الحفظ
    const { putData, loading: updating } = usePut("/api/admin/decimal-setting");

    useEffect(() => {
        console.log("Full Data from Hook:", data); // شوفي الداتا طالعة إزاي في الكونسول

        // فحص المسار الصحيح بناءً على الـ Console
        const setting = data?.data?.setting || data?.setting;

        if (setting) {
            setDecimalData(setting);
        }
    }, [data]);
    // 3. دالة التعديل المختصرة باستخدام usePut
    const handleUpdate = async (formData) => {
        const payload = {
            decimal_places: Number(formData.decimal_places),
        };

        // نرسل الطلب مباشرة، الهوك سيتعامل مع الـ Loading والـ Error Catching
        const response = await putData(payload);

        if (response?.success) {
            toast.success("Settings updated successfully");
            setIsEditing(false);
            refetch(); // تحديث البيانات المعروضة فوراً
        } else {
            // إضافة عرض الخطأ من الـ Response اللي بعتيه
            const errorMessage = response?.error?.message || response?.message || "Update failed";
            toast.error(errorMessage);
        }
    };

    const fields = [
        {
            key: "decimal_places",
            label: "Decimal Places",
            type: "number",
            placeholder: "e.g. 2 or 3",
            min: 0,
            max: 3,
            required: true,
            validate: (value) => (value >= 0 && value <= 3) || "Value must be between 0 and 3",
            inputMode: "numeric",
        },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    if (isEditing) {
        return (
            <AddPage
                title="Edit Decimal Settings"
                description="Modify the system-wide decimal precision settings."
                fields={fields}
                initialData={{ decimal_places: decimalData?.decimal_places }}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
                loading={updating} // نستخدم الـ loading الخاص بـ usePut
                submitButtonText="Save Changes"
            />
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Settings2 className="text-red-600" size={28} />
                        </div>
                        System Settings
                    </h1>
                    <p className="text-gray-500 mt-1 ml-1 pl-12">
                        View and manage global decimal precision
                    </p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                >
                    <Edit size={18} />
                    Edit Settings
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Activity className="animate-spin text-red-500" size={40} />
                    <p className="text-gray-500 font-medium">Loading settings data...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800 text-lg">Configuration Details</h2>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide uppercase">
                            Active
                        </span>
                    </div>

                    <div className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Decimal Value Card */}
                            <div className="p-8 flex items-center gap-6 border-b md:border-b-0 md:border-r border-gray-100">
                                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                                    <Hash size={36} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Decimal Places
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-5xl font-extrabold text-gray-900">
                                            {decimalData?.decimal_places ?? 0}
                                        </p>
                                        <span className="text-lg font-medium text-gray-400">Digits</span>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info Card */}
                            <div className="p-8 flex flex-col justify-center gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Last Updated</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatDate(decimalData?.updatedAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Created At</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatDate(decimalData?.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Footer */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100">
                            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs text-gray-500 font-mono">
                                <div className="flex items-center gap-2">
                                    <Fingerprint size={14} className="text-gray-400" />
                                    <span>ID: {decimalData?._id || "N/A"}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Decimal;