import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import {
    Store,
    Save,
    ImagePlus,
    Loader2,
    LayoutTemplate,
    Palette,
    Type,
    Check,
    RotateCcw,
    ShoppingBag,
    ChevronRight,
    Layers
} from "lucide-react";

/* ─────────────────── Initial Form Shape ─────────────────── */
const EMPTY_FORM = {
    key: "main",
    templateSlug: "",
    templateSectionsSnapshot: [],
    storeName: "",
    logoUrl: "",
    fontStyle: "classic",
    colors: {},
    sections: []
};

/* ─────────────────── Sub-components ─────────────────── */

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
                relative inline-flex h-7 w-12 shrink-0 items-center rounded-full
                transition-all duration-300 focus:outline-none focus:ring-2
                focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-40 disabled:cursor-not-allowed
                ${checked
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200"
                    : "bg-gray-200"
                }
            `}
        >
            <span
                className={`
                    inline-block h-5 w-5 transform rounded-full bg-white shadow-md
                    transition-transform duration-300
                    ${checked ? "translate-x-6" : "translate-x-1"}
                `}
            />
        </button>
    );
}

function TabBtn({ active, icon: Icon, label, badge, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center gap-2.5 px-5 py-3.5 text-sm font-semibold
                rounded-xl transition-all duration-300 whitespace-nowrap
                ${active
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }
            `}
        >
            <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
            {label}
            {badge != null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function SectionRow({ section, onToggle }) {
    return (
        <div className={`flex items-center justify-between px-5 py-4 transition-all duration-200 ${section.enabled ? "bg-white" : "bg-gray-50/60"}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${section.enabled ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                    <Layers className="w-4 h-4" />
                </div>
                <div>
                    <p className={`text-sm font-semibold capitalize transition-colors duration-300 ${section.enabled ? "text-gray-800" : "text-gray-400"}`}>
                        {section.key}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {section.enabled ? "Visible on storefront" : "Hidden from storefront"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${section.enabled ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    {section.enabled ? "On" : "Off"}
                </span>
                <Toggle checked={section.enabled} onChange={() => onToggle(section.key)} />
            </div>
        </div>
    );
}

/* ─────────────────── Main Component ─────────────────── */

export default function Ecommerce() {
    /* 1. GET Current Store Settings */
    const { data: settingsRes, loading: isFetching, refetch } = useGet("/api/admin/store-settings");
    const { putData, loading: isSaving } = usePut("/api/admin/store-settings");

    const [activeTab, setActiveTab] = useState("general");
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [dragOver, setDragOver] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [pendingSlug, setPendingSlug] = useState(null);

    const fileInputRef = useRef(null);

    /* Fill Form Data based on response: response.data.settings */
    useEffect(() => {
        const s = settingsRes?.data?.settings || settingsRes?.settings;
        if (!s) return;

        setFormData({
            key: s.key || "main",
            templateSlug: s.templateSlug || "",
            templateSectionsSnapshot: Array.isArray(s.templateSectionsSnapshot) ? s.templateSectionsSnapshot : [],
            storeName: s.storeName || "",
            logoUrl: s.logoUrl || "",
            fontStyle: s.fontStyle || "classic",
            colors: s.colors || {},
            sections: Array.isArray(s.sections) ? s.sections : []
        });
    }, [settingsRes]);

    /* 2. GET Categories: response.data.categories.categories */
    const { data: categoriesRes, loading: isLoadingCategories } = useGet(
        "/api/admin/store-settings/themes/categories"
    );

    const rawCategories = categoriesRes?.data?.categories?.categories 
        ?? categoriesRes?.data?.categories 
        ?? categoriesRes?.categories?.categories 
        ?? categoriesRes?.categories;

    const categories = Array.isArray(rawCategories) ? rawCategories : [];

    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0]._id);
        }
    }, [categories, selectedCategoryId]);

    /* 3. GET Themes in Category: response.data.themes.data */
    const themesUrl = activeTab === "template" && selectedCategoryId
        ? `/api/admin/store-settings/themes/categories/${selectedCategoryId}`
        : null;

    const { data: themesRes, loading: isLoadingThemes } = useGet(themesUrl);

    const rawThemes = themesRes?.data?.themes?.data 
        ?? themesRes?.data?.themes 
        ?? themesRes?.themes 
        ?? themesRes?.data;

    const themes = Array.isArray(rawThemes) ? rawThemes : [];

    /* 4. GET Single Theme Details by Slug */
    const themeDetailsUrl = pendingSlug 
        ? `/api/admin/store-settings/themes/${pendingSlug}` 
        : null;

    const { data: themeDetailsRes, loading: isLoadingThemeDetails } = useGet(themeDetailsUrl);

    useEffect(() => {
        if (!pendingSlug || !themeDetailsRes) return;

        const theme = themeDetailsRes?.data?.theme || themeDetailsRes?.theme || themeDetailsRes?.data || themeDetailsRes;
        if (!theme) return;

        applyThemeToForm(theme);
        setPendingSlug(null);
        toast.success("Template selected! Customize it below.");
        setActiveTab("customize");
    }, [themeDetailsRes, pendingSlug]);

    /* Helper function to map selected theme to local state */
    const applyThemeToForm = (theme) => {
        const slug = theme.slug || theme.templateSlug || theme.name;
        const defaultConfig = theme.defaultConfig || {};
        const rawSections = theme.sections || theme.sectionsSnapshot || [];

        const mappedSections = (Array.isArray(rawSections) ? rawSections : []).map(sec => ({
            key: typeof sec === "string" ? sec : sec.key,
            enabled: typeof sec === "object" && sec.enabled !== undefined ? sec.enabled : true,
            templateSlug: slug
        }));

        const sectionSnapshotKeys = mappedSections.map(s => s.key);
        const themeColors = defaultConfig.colors && Object.keys(defaultConfig.colors).length > 0
            ? defaultConfig.colors
            : (Object.keys(formData.colors).length > 0 ? formData.colors : { primary: "#3498db", secondary: "#2ecc71", background: "#ffffff" });

        setFormData(prev => ({
            ...prev,
            templateSlug: slug,
            templateSectionsSnapshot: sectionSnapshotKeys,
            sections: mappedSections,
            colors: themeColors,
            fontStyle: defaultConfig.fontOptions?.[0] || prev.fontStyle || "classic"
        }));
    };

    /* Logo Handlers */
    const processFile = (file) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error("Image size must be less than 2 MB"); return; }
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleColorChange = (key, val) => {
        setFormData(prev => ({ ...prev, colors: { ...prev.colors, [key]: val } }));
    };

    const toggleSection = (key) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s)
        }));
    };

    /* 5. PUT Save Settings */
    const handleSave = async () => {
        try {
            await putData(formData);
            toast.success("Store settings updated successfully!");
            refetch();
        } catch {
            toast.error("Failed to update store settings.");
        }
    };

    const handleReset = () => {
        const s = settingsRes?.data?.settings || settingsRes?.settings;
        if (!s) return;
        setFormData({
            key: s.key || "main",
            templateSlug: s.templateSlug || "",
            templateSectionsSnapshot: Array.isArray(s.templateSectionsSnapshot) ? s.templateSectionsSnapshot : [],
            storeName: s.storeName || "",
            logoUrl: s.logoUrl || "",
            fontStyle: s.fontStyle || "classic",
            colors: s.colors || {},
            sections: Array.isArray(s.sections) ? s.sections : []
        });
        toast.info("Changes reset to last saved state.");
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-200 animate-pulse">
                    <Store className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold text-gray-700">Loading Store Settings...</p>
                </div>
            </div>
        );
    }

    const TABS = [
        { key: "general", label: "General", icon: Store },
        { key: "template", label: "Templates", icon: LayoutTemplate, badge: themes.length || null },
        { key: "customize", label: "Customize", icon: Palette }
    ];

    const enabledCount = (formData.sections || []).filter(s => s.enabled).length;
    const sectionsTotal = (formData.sections || []).length;
    
    // Safely extract color keys from formData.colors
    const colorKeys = Object.keys(formData.colors || {});

    return (
        <div className="max-w-5xl mx-auto mt-8 mb-16 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 shadow-2xl shadow-indigo-200">
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-white/15 backdrop-blur rounded-2xl border border-white/20">
                            <ShoppingBag className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Store Settings</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">Manage identity, choose a template & customize storefront</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleReset}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 shadow-lg transition-all active:scale-95"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="relative mt-6 flex flex-wrap gap-3">
                    {[
                        { label: "Store Name", value: formData.storeName || "Not set" },
                        { label: "Template", value: formData.templateSlug || "None" },
                        { label: "Sections", value: sectionsTotal ? `${enabledCount}/${sectionsTotal} active` : "None" },
                        { label: "Font", value: formData.fontStyle || "classic" },
                    ].map(stat => (
                        <div key={stat.label} className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-xl px-4 py-2">
                            <span className="text-indigo-200 text-xs">{stat.label}:</span>
                            <span className="text-white text-xs font-semibold truncate max-w-[120px]">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {TABS.map(tab => (
                    <TabBtn
                        key={tab.key}
                        active={activeTab === tab.key}
                        icon={tab.icon}
                        label={tab.label}
                        badge={tab.badge}
                        onClick={() => setActiveTab(tab.key)}
                    />
                ))}
            </div>

            {/* TAB 1: General Settings */}
            {activeTab === "general" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700">Store Logo</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center h-52 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                                dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-indigo-400"
                            }`}
                        >
                            {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-4" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <ImagePlus className="w-8 h-8" />
                                    <span className="text-sm font-semibold">Upload Logo</span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} className="hidden" />
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Store Name</label>
                            <input
                                type="text"
                                value={formData.storeName}
                                onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="Enter store name..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Templates & Categories */}
            {activeTab === "template" && (
                <div className="space-y-5">
                    {/* Categories Filter */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-4">Categories</h2>
                        {isLoadingCategories ? (
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                        ) : categories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => {
                                    const isActive = selectedCategoryId === cat._id;
                                    return (
                                        <button
                                            key={cat._id}
                                            onClick={() => setSelectedCategoryId(cat._id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                            }`}
                                        >
                                            {isActive && <Check className="w-3.5 h-3.5" />}
                                            {cat.ar_name || cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No categories found.</p>
                        )}
                    </div>

                    {/* Themes Grid */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-5">Available Themes</h2>
                        {isLoadingThemes ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : themes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {themes.map(theme => {
                                    const slug = theme.slug || theme.templateSlug || theme.name;
                                    const isApplied = formData.templateSlug === slug;
                                    const isPending = pendingSlug === slug && isLoadingThemeDetails;

                                    return (
                                        <div
                                            key={theme._id || slug}
                                            className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                                                isApplied ? "border-indigo-500 shadow-lg" : "border-gray-100 hover:border-indigo-300"
                                            }`}
                                        >
                                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                                {theme.thumbnailUrl || theme.imageUrl || theme.image ? (
                                                    <img 
                                                        src={theme.thumbnailUrl || theme.imageUrl || theme.image} 
                                                        alt={theme.name} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <LayoutTemplate className="w-10 h-10 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-sm font-bold text-gray-900 mb-3">{theme.name || slug}</h3>
                                                <button
                                                    onClick={() => {
                                                        // Apply locally directly from theme object, or fetch details if slug needed
                                                        if (theme.sections && theme.sections.length) {
                                                            applyThemeToForm(theme);
                                                            toast.success("Template selected!");
                                                            setActiveTab("customize");
                                                        } else {
                                                            setPendingSlug(slug);
                                                        }
                                                    }}
                                                    disabled={isApplied || isPending}
                                                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                                                        isApplied
                                                            ? "bg-indigo-50 text-indigo-600 cursor-default"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                    }`}
                                                >
                                                    {isPending ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : isApplied ? (
                                                        <Check className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    )}
                                                    {isApplied ? "Selected" : "Apply Theme"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">No themes available in this category.</p>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: Customize Options */}
            {activeTab === "customize" && (
                <div className="space-y-5">
                    {/* Colors Options */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Palette className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-base font-bold text-gray-900">Colors Configuration</h2>
                        </div>
                        {colorKeys.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {colorKeys.map(key => (
                                    <div key={key} className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.colors[key] || "#000000"}
                                            onChange={(e) => handleColorChange(key, e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 capitalize">{key}</p>
                                            <input
                                                type="text"
                                                value={formData.colors[key] || ""}
                                                onChange={(e) => handleColorChange(key, e.target.value)}
                                                className="w-24 text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 mt-1"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No color options defined.</p>
                        )}
                    </div>

                    {/* Font Style Input */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Type className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-base font-bold text-gray-900">Font Style</h2>
                        </div>
                        <input
                            type="text"
                            value={formData.fontStyle}
                            onChange={(e) => setFormData(prev => ({ ...prev, fontStyle: e.target.value }))}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full max-w-xs"
                            placeholder="Font style (e.g. classic, modern)..."
                        />
                    </div>

                    {/* Store Sections */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-base font-bold text-gray-900">Storefront Sections</h2>
                            </div>
                        </div>
                        {formData.sections && formData.sections.length > 0 ? (
                            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
                                {formData.sections.map(sec => (
                                    <SectionRow key={sec.key} section={sec} onToggle={toggleSection} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No sections available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}