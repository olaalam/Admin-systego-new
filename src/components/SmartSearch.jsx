import { Search } from "lucide-react";
import { useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

const SmartSearch = ({ value, onChange, onSearch }) => {
  const { t } = useTranslation();
  const debounceRef = useRef(null);

  const handleChange = useCallback(
    (val) => {
      // ✅ حدّث القيمة فوراً في الـ input
      onChange(val);

      // ✅ لو في onSearch (بحث API)، اعمله debounce 500ms
      if (onSearch) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onSearch(val);
        }, 500);
      }
    },
    [onChange, onSearch]
  );

  const handleKeyDown = (e) => {
    // ✅ لو ضغط Enter أو السكنر بعث Enter، ابحث فوراً
    if (e.key === "Enter" && onSearch) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSearch(value);
    }
  };

  return (
    <div className="relative flex gap-2 w-full">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          autoFocus
          placeholder={t("search_placeholder")}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>
    </div>
  );
};

export default SmartSearch;