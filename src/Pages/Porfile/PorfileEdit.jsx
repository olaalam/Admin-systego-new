// src/pages/PointsEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function PorfileEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const { putData, loading: updating } = usePut(`/api/admin/profile/${id}`);

    const [profileData, setProfileData] = useState(null);
    const [fetching, setFetching] = useState(true);

    /* =======================
       Fields
    ======================= */
    const fields = useMemo(
        () => [
            {
                key: "amount",
                label: t("Amount"),
                type: "number",
                required: true,
                min: 0,
                placeholder: "e.g. 30",
            },
            {
                key: "points",
                label: t("Points"),
                type: "number",
                required: true,
                min: 0,
                placeholder: "e.g. 30",
            },
        ],
        []
    );

    /* =======================
       Fetch Point
    ======================= */
    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;

            try {
                const res = await api.get(`/api/admin/profile/${id}`);
                console.log("🔍 Profile Response:", res.data);

                const profile =
                    res.data?.data?.profile ||
                    res.data?.data ||
                    res.data?.profile;

                if (!profile) {
                    toast.error(t("profilenotfound"));
                    navigate("/profile");
                    return;
                }

                setProfileData({
                    amount: Number(profile.amount) || 0,
                    points: Number(profile.points) || 0,
                });
            } catch (err) {
                console.error("❌ Error fetching profile:", err);
                toast.error(t("Failedtoloadprofiledata"));
                navigate("/profile");
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [id, navigate]);

    /* =======================
       Submit
    ======================= */
    const handleSubmit = async (formData) => {
        try {
            const payload = {
                amount: Number(formData.amount),
                points: Number(formData.points),
            };

            await putData(payload);

            toast.success(t("profileUpdatedSuccessfully"));
            navigate("/profile");
        } catch (err) {
            console.error("❌ Update error:", err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error?.message ||
                "Failedtoupdateprofile";

            toast.error(errorMessage);
        }
    };

    const handleCancel = () => navigate("/profile");

    if (fetching) return <Loader />;

    if (!profileData) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen text-center">
                <p className="text-red-600 text-lg">{t("Profilenotfound")}</p>
                <button
                    onClick={() => navigate("/profile")}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <AddPage
                title={t("EditProfile")}
                description={t("EditProfileDescription")}
                submitButtonText={t("UpdateProfile")}
                fields={fields}
                initialData={profileData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={updating}
            />
        </div>
    );
}
