import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const EcommerceDataAdd = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { postData, loading: submitting } = usePost("/api/admin/ecommerce-data");

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

  const fields = useMemo(
    () => [
      // 🏷️ 1. البيانات العامة للمتجر (مجمعة مرة واحدة)
      {
        key: "name",
        label: isRTL ? "اسم المتجر" : "Store Name",
        type: "text",
        required: true,
        placeholder: isRTL ? "مثال: المتجر الرئيسي" : "e.g. Main Store",
      },
      {
        key: "phone",
        label: isRTL ? "رقم الهاتف" : "Phone Number",
        type: "text",
        required: false,
        placeholder: "0123456789",
      },
      {
        key: "email",
        label: isRTL ? "البريد الإلكتروني" : "Email Address",
        type: "email",
        required: false,
        placeholder: "store@example.com",
      },
      {
        key: "address",
        label: isRTL ? "عنوان المتجر" : "Physical Address",
        type: "text",
        required: false,
        placeholder: isRTL ? "مثال: القاهرة، مصر" : "e.g. Cairo, Egypt",
      },

      // 🔝 2. إعدادات الهيدر (Header)
      {
        key: "header_title",
        label: isRTL ? "عنوان الهيدر (Header Title)" : "Header Title",
        type: "text",
        required: false,
        placeholder: isRTL ? "اسم المتجر في الهيدر" : "Store name in header",
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
        placeholder: isRTL ? "مثال: شحن مجاني للطلبات فوق 500 جنيه!" : "e.g. Free shipping on orders over $50!",
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
        placeholder: isRTL ? "مثال: جميع الحقوق محفوظة © 2026" : "e.g. All Rights Reserved © 2026",
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

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name || "Main Store",
        phone: formData.phone || "",
        email: formData.email || "",
        address: formData.address || "",
        status: formData.status ? "active" : "inactive",
        social_links: {
          facebook: formData.facebook || "",
          instagram: formData.instagram || "",
          whatsapp: formData.whatsapp || "",
          tiktok: formData.tiktok || "",
          twitter: formData.twitter || "",
          youtube: formData.youtube || "",
          linkedin: formData.linkedin || "",
        },
        header: {
          logo: formData.header_logo || undefined,
          title: formData.header_title || "",
          announcement: formData.header_announcement || "",
          links: (Array.isArray(formData.header_links) ? formData.header_links : []).slice(0, 5),
        },
        footer: {
          logo: formData.footer_logo || undefined,
          bio: formData.footer_bio || "",
          copyright: formData.footer_copyright || "",
        },
      };

      await postData(payload);

      toast.success(isRTL ? "تم حفظ بيانات المتجر بنجاح!" : "Ecommerce Data Added Successfully!");
      navigate("/ecommerce-data");
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("Failed to add ecommerce data")
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <AddPage
        title={isRTL ? "إضافة بيانات المتجر (Header & Footer)" : "Add Ecommerce Header & Footer Data"}
        description={isRTL ? "قم بإدخال بيانات المتجر، إعدادات الهيدر، الفوتر وروابط التواصل" : "Fill in Store, Header, Footer, and Social info below"}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/ecommerce-data")}
        loading={submitting}
        initialData={{
          name: isRTL ? "المتجر الرئيسي" : "Main Store",
          status: true,
          header_links: ["home", "about", "products", "categories", "brands"],
        }}
      />
    </div>
  );
};

export default EcommerceDataAdd;
