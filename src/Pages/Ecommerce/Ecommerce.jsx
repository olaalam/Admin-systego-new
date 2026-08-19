import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import {
    Store,
    Edit2,
    Save,
    X,
    ImagePlus,
    Loader2
} from "lucide-react";

export default function Ecommerce() {
    const { data, loading: isFetching, refetch } = useGet("/api/store/store-settings");
    const { putData, loading: isUpdating } = usePut("/api/store/store-settings");

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ title: "", logo: "" });
    const [preview, setPreview] = useState(null);

    // Ref عشان نربط الضغط على الصورة بـ input الملفات المخفي
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (data?.settings) {
            setFormData({
                title: data.settings.title || "",
                logo: data.settings.logo || "",
            });
            setPreview(data.settings.logo || null);
        }
    }, [data]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData((prev) => ({ ...prev, logo: base64String }));
                setPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTitleChange = (e) => {
        setFormData((prev) => ({ ...prev, title: e.target.value }));
    };

    const handleSave = async () => {
        try {
            await putData({
                title: formData.title,
                logo: formData.logo,
            });
            toast.success("Store settings updated successfully");
            setIsEditing(false);
            refetch();
        } catch (err) {
            toast.error("Failed to update settings");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (data?.settings) {
            setFormData({
                title: data.settings.title || "",
                logo: data.settings.logo || "",
            });
            setPreview(data.settings.logo || null);
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium animate-pulse">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mt-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

            {/* === Header Section === */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>
                        <p className="text-sm text-gray-500">Manage your store's identity</p>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 active:scale-95"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                )}
            </div>

            {/* === Content Section === */}
            <div className="space-y-8">
                {/* Logo Section */}
                <div className="flex flex-col items-start gap-3">
                    <label className="text-sm font-semibold text-gray-700">Store Logo</label>

                    <div
                        className={`relative w-36 h-36 rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-gray-50 transition-all duration-300 ${isEditing
                                ? "border-dashed border-indigo-300 hover:border-indigo-500 cursor-pointer group"
                                : "border-solid border-gray-100"
                            }`}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Store Logo"
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 p-2"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Store className="w-10 h-10 mb-2 opacity-50" />
                                <span className="text-xs font-medium">No Logo</span>
                            </div>
                        )}

                        {/* Hover Overlay in Edit Mode */}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ImagePlus className="text-white w-8 h-8 mb-2 animate-bounce" />
                                <span className="text-white text-xs font-semibold">Change Logo</span>
                            </div>
                        )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        className="hidden"
                    />
                    {isEditing && (
                        <p className="text-xs text-gray-500 font-medium">Click the image to upload a new logo (Max 2MB)</p>
                    )}
                </div>

                {/* Title Section */}
                <div className="space-y-2 relative">
                    <label className="block text-sm font-semibold text-gray-700">Store Title</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                            placeholder="e.g. Systego Store"
                        />
                    ) : (
                        <div className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3.5 flex items-center transition-all duration-300">
                            <span className="text-lg text-gray-800 font-medium">{formData.title || "No Title Set"}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons (Smooth slide down effect) */}
                <div
                    className={`flex justify-end gap-3 pt-6 border-t border-gray-100 overflow-hidden transition-all duration-500 ease-in-out ${isEditing ? "opacity-100 max-h-32 translate-y-0" : "opacity-0 max-h-0 -translate-y-4"
                        }`}
                >
                    <button
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-6 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 disabled:opacity-50 active:scale-95"
                    >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all duration-300 disabled:opacity-70 active:scale-95"
                    >
                        {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}