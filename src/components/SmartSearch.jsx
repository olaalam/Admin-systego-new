import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const SmartSearch = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="relative flex gap-2 w-full">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          autoFocus // ✅ مهم جداً للسكنر عشان يلقط الكود فوراً أول ما الصفحة تفتح
          placeholder={t("search_placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>
    </div>
  );
};

export default SmartSearch;