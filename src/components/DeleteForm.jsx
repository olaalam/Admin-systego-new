import React from "react";
import { useTranslation } from "react-i18next";

const DeleteDialog = ({
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = "Delete",
  cancelText = "Cancel",
  className = "",
  loading = false,
}) => {
    const { t } = useTranslation();

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black/60 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 transition-opacity"
          >
            {t(cancelText)}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 transition-opacity"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {t(confirmText)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;