import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function EcommerceDataEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { putData, loading: updating } = usePut(`/api/admin/ecommerce-data/${id}`);

  const [formData, setFormData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const headerLinkOptions = useMemo(
    () => [
      { label: isRTL ? "الرئيسية (Home)" : "Home", value: "home" },
      { label: isRTL ? "من نحن (About)" : "About", value: "about" },
      { label: isRTL ? "المنتجات (Products)" : "Products", value: "products" },
      { label: isRTL ? "الأقسام (Categories)" : "Categories", value: "categories" },
      { label: isRTL ? "العلامات التجارية (Brands)" : "Brands", value: "brands" },
    ],
    [isRTL]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/ecommerce-data/${id}`);
        const record = res.data?.data?.data || res.data?.data || res.data?.user || res.data;

        if (!record) {
          toast.error(t("Record not found"));
          navigate("/ecommerce-data");
          return;
        }

        const normalizedLinks = Array.isArray(record.header?.links)
          ? record.header.links.map((l) => (typeof l === "string" ? l : (l?.title || ""))).filter(Boolean)
          : [];

        setFormData({
          name: record.name || "",
          phone: record.phone || record.footer?.phone || "",
          email: record.email || record.footer?.email || "",
          address: record.address || record.footer?.address || "",
          // Header
          header_title: record.header?.title || "",
          header_logo: record.header?.logo || "",
          header_announcement: record.header?.announcement || "",
          header_links: normalizedLinks,
          // Footer
          footer_logo: record.footer?.logo || "",
          footer_bio: record.footer?.bio || record.bio || "",
          footer_copyright: record.footer?.copyright || "",
          // Social links
          facebook: record.social_links?.facebook || record.footer?.social_links?.facebook || "",
          instagram: record.social_links?.instagram || record.footer?.social_links?.instagram || "",
          whatsapp: record.social_links?.whatsapp || record.footer?.social_links?.whatsapp || "",
          tiktok: record.social_links?.tiktok || record.footer?.social_links?.tiktok || "",
          twitter: record.social_links?.twitter || record.footer?.social_links?.twitter || "",
          youtube: record.social_links?.youtube || record.footer?.social_links?.youtube || "",
          linkedin: record.social_links?.linkedin || record.footer?.social_links?.linkedin || "",
          status: record.status === "active",
        });
      } catch (err) {
        toast.error(t("Failed to fetch ecommerce data"));
        console.error("Error fetching ecommerce data:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate, t]);

  const fields = useMemo(
    () => [
      // 🏷️ 1. البيانات العامة للمتجر (مجمعة مرة واحدة)
      {
        key: "name",
        label: isRTL ? "اسم المتجر" : "Store Name",
        type: "text",
        required: true,
      },
      {
        key: "phone",
        label: isRTL ? "رقم الهاتف" : "Phone Number",
        type: "text",
        required: false,
      },
      {
        key: "email",
        label: isRTL ? "البريد الإلكتروني" : "Email Address",
        type: "email",
        required: false,
      },
      {
        key: "address",
        label: isRTL ? "عنوان المتجر" : "Physical Address",
        type: "text",
        required: false,
      },

      // 🔝 2. إعدادات الهيدر (Header)
      {
        key: "header_title",
        label: isRTL ? "عنوان الهيدر (Header Title)" : "Header Title",
        type: "text",
        required: false,
      },
      {
        key: "header_logo",
        label: isRTL ? "لوجو الهيدر (Header Logo)" : "Header Logo",
        type: "image",
        required: false,
      },
      {
        key: "header_announcement",
        label: isRTL ? "شريط الإعلانات أعلى الصفحة (Announcement Bar)" : "Top Announcement Bar",
        type: "text",
        required: false,
      },
      {
        key: "header_links",
        label: isRTL
          ? "روابط قائمة الهيدر (حد أقصى 5 روابط)"
          : "Header Navigation Links (Max 5)",
        type: "multiselect",
        options: headerLinkOptions,
        creatable: false,
        placeholder: isRTL
          ? "اختر حتى 5 روابط كحد أقصى للهيدر..."
          : "Select up to 5 links max...",
        onChange: (val, setFormData) => {
          if (Array.isArray(val) && val.length > 5) {
            toast.warn(
              isRTL
                ? "عفواً، الحد الأقصى لروابط الهيدر هو 5 روابط فقط!"
                : "Maximum 5 links allowed in the Header!"
            );
            setFormData((prev) => ({
              ...prev,
              header_links: val.slice(0, 5),
            }));
          }
        },
      },

      // 🔻 3. إعدادات الفوتر (Footer)
      {
        key: "footer_logo",
        label: isRTL ? "لوجو الفوتر (Footer Logo)" : "Footer Logo",
        type: "image",
        required: false,
      },
      {
        key: "footer_bio",
        label: isRTL ? "نبذة عن المتجر في الفوتر (Footer Bio)" : "Footer Store Bio / Description",
        type: "textarea",
        required: false,
      },
      {
        key: "footer_copyright",
        label: isRTL ? "حقوق الملكية (Copyright Text)" : "Copyright Text",
        type: "text",
        required: false,
      },

      // 🌐 4. روابط التواصل الاجتماعي (Social Links)
      {
        key: "facebook",
        label: t("Facebook URL"),
        type: "text",
        required: false,
      },
      {
        key: "instagram",
        label: t("Instagram URL"),
        type: "text",
        required: false,
      },
      {
        key: "whatsapp",
        label: t("WhatsApp Number"),
        type: "text",
        required: false,
      },
      {
        key: "tiktok",
        label: t("TikTok URL"),
        type: "text",
        required: false,
      },
      {
        key: "twitter",
        label: t("Twitter URL"),
        type: "text",
        required: false,
      },
      {
        key: "youtube",
        label: "YouTube Channel URL",
        type: "text",
        required: false,
      },
      {
        key: "linkedin",
        label: "LinkedIn URL",
        type: "text",
        required: false,
      },
      {
        key: "status",
        label: t("Active"),
        type: "switch",
        required: false,
      },
    ],
    [t, isRTL, headerLinkOptions]
  );

  const handleSubmit = async (data) => {
    try {
      const payload = {
        name: data.name || "Main Store",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        status: data.status ? "active" : "inactive",
        social_links: {
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          whatsapp: data.whatsapp || "",
          tiktok: data.tiktok || "",
          twitter: data.twitter || "",
          youtube: data.youtube || "",
          linkedin: data.linkedin || "",
        },
        header: {
          logo: data.header_logo !== undefined ? data.header_logo : undefined,
          title: data.header_title || "",
          announcement: data.header_announcement || "",
          links: (Array.isArray(data.header_links) ? data.header_links : []).slice(0, 5),
        },
        footer: {
          logo: data.footer_logo !== undefined ? data.footer_logo : undefined,
          bio: data.footer_bio || "",
          copyright: data.footer_copyright || "",
        },
      };

      await putData(payload);

      toast.success(isRTL ? "تم تحديث بيانات المتجر بنجاح!" : "Ecommerce Data Updated Successfully!");
      navigate("/ecommerce-data");
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("Failed to update ecommerce data")
      );
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <AddPage
        title={isRTL ? "تعديل بيانات المتجر (Header & Footer)" : "Edit Ecommerce Header & Footer Data"}
        description={isRTL ? "قم بتعديل بيانات المتجر، إعدادات الهيدر، الفوتر وروابط التواصل" : "Update Store, Header, Footer, and Social info below"}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/ecommerce-data")}
        initialData={formData}
        loading={updating}
        submitButtonText={isRTL ? "تحديث البيانات" : "Update Data"}
      />
    </div>
  );
}
