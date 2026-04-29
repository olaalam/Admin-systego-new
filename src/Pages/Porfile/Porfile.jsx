import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import {
    User, Mail, Phone, Building2, ShieldCheck,
    Warehouse, Edit3, Trash2, X, Save
} from "lucide-react";

const Profile = () => {
    const { data, loading, error, refetch } = useGet("/api/admin/profile");
    const { deleteData, loading: deleting } = useDelete("/api/admin/profile");
    const { putData, loading: updating } = usePut("/api/admin/profile"); // افترضنا وجود hook للتحديث
    const { t } = useTranslation();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State للـ Form
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
    });

    const profile = data?.profile;

    // تحديث الـ Form لما البيانات تيجي من الـ API
    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || "",
                email: profile.email || "",
                phone: profile.phone || "",
            });
        }
    }, [profile]);

    /* =======================
       Update Logic
    ======================= */
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // الترتيب الصحيح حسب الـ Hook عندك: (البيانات، ثم المسار)
            await putData(formData, "/api/admin/profile");

            toast.success(t("profileUpdatedSuccessfully"));
            setIsEditModalOpen(false);
            refetch();
        } catch (err) {
            console.error("Update Error Details:", err);
            // لا داعي لعمل toast هنا لأن الـ Hook يرمي الخطأ وأنت تمسكه بالفعل
        }
    };

    /* =======================
       Delete Logic
    ======================= */
    const handleDelete = async () => {
        try {
            await deleteData(`/api/admin/profile/${profile.id}`);
            toast.success(t("profiledeletedsuccessfully"));
            refetch();
        } finally {
            setShowDeleteDialog(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("profileManagement")}</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 text-2xl font-bold capitalize">
                                    {profile?.username?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{profile?.username}</h2>
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded mt-1 inline-block font-mono">
                                        ID: {profile?.id}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-sm"
                                >
                                    <Edit3 size={16} />
                                    {t("Edit")}
                                </button>
                                <button
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all shadow-sm"
                                >
                                    <Trash2 size={16} />
                                    {t("Delete")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard icon={<User size={18} />} label={t("Username")} value={profile?.username} />
                        <InfoCard icon={<Mail size={18} />} label={t("Email")} value={profile?.email} />
                        <InfoCard icon={<Phone size={18} />} label={t("Phone")} value={profile?.phone} />
                        <InfoCard icon={<Building2 size={18} />} label={t("Company")} value={profile?.company_name} />
                        <InfoCard icon={<Warehouse size={18} />} label={t("Warehouse")} value={profile?.warehouse_name} />
                        <InfoCard
                            icon={<ShieldCheck size={18} />}
                            label={t("Status")}
                            value={
                                <span className={`px-2 py-1 rounded text-xs font-bold ${profile?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {profile?.status?.toUpperCase()}
                                </span>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{t("EditProfile")}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Username")}</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Email")}</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Phone")}</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {updating ? <Loader size="sm" /> : <><Save size={18} /> {t("SaveChanges")}</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                                >
                                    {t("Cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            {showDeleteDialog && (
                <DeleteDialog
                    title={t("Deleteprofile")}
                    message={t("DeleteprofileMessage")}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

const InfoCard = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
        <div className="p-2 bg-white rounded-md shadow-sm text-primary">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</p>
            <p className="text-gray-900 font-medium mt-1">{value || "---"}</p>
        </div>
    </div>
);

export default Profile;