// src/Pages/Shipping/AramexCard.jsx
import { Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const AramexCard = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative opacity-60">
      {/* Coming Soon Badge */}
      <div className="absolute top-4 end-4 z-10">
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 text-[10px] font-bold">
          {t("Coming_Soon") || "COMING SOON"}
        </Badge>
      </div>

      {/* Header */}
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Rocket size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {t("Aramex") || "Aramex"}
              </h3>
              <p className="text-xs text-gray-500">
                {t("Aramex_Integration") || "Aramex Integration"}
              </p>
            </div>
          </div>
          <Switch dir={isRTL ? "rtl" : "ltr"} checked={false} disabled />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 flex-1 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Rocket size={28} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {t("Feature_Coming_Soon") || "This integration is coming soon"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("Stay_Tuned") || "Stay tuned for updates"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AramexCard;
