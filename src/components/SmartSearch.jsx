import { useState } from "react";
import { Search, Camera, X } from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useTranslation } from "react-i18next";

const SmartSearch = ({ value, onChange }) => {
  const [openScanner, setOpenScanner] = useState(false);
 const { t  } = useTranslation();
   return (
    <div className="relative flex gap-2 w-full">
      {/* Input */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
placeholder={t("search_placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Scan Button */}
      <button
        type="button"
        onClick={() => setOpenScanner(true)}
        className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-1"
      >
        <Camera size={18} />
        {t("Scan")}
      </button>

      {/* Scanner Modal */}
      {openScanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{t("ScanCode")}</h3>
              <button onClick={() => setOpenScanner(false)}>
                <X />
              </button>
            </div>

            <BarcodeScannerComponent
              width={300}
              height={300}
              onUpdate={(err, result) => {
                if (result) {
                  onChange(result.text);
                  setOpenScanner(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
