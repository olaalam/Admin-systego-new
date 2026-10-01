// src/Pages/Shipping/FreeShippingCard.jsx
import { Gift, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FreeShippingCard = ({ enabled, onToggle, saving }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
            <Gift size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {t("Free_Shipping") || "Free Shipping"}
            </h3>
            <p className="text-xs text-gray-500">
              {t("Enable_free_shipping") || "Enable free shipping globally"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold ${
              enabled ? "text-green-600" : "text-gray-400"
            }`}
          >
            {enabled ? t("Active") || "Active" : t("Inactive") || "Inactive"}
          </span>
          <Switch
            dir={isRTL ? "rtl" : "ltr"}
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={saving}
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <Button
          variant="outline"
          onClick={() => navigate("/free-shipping-products")}
          className="w-full"
        >
          <Gift size={15} className="me-2" />
          {t("Manage_Free_Shipping_Products") || "Manage Products"}
          <ArrowRight size={15} className="ms-2" />
        </Button>
      </div>
    </div>
  );
};

export default FreeShippingCard;
