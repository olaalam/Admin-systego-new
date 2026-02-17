import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { Calendar, Package, MapPin, AlertCircle } from "lucide-react";

const NotificationDetailModal = ({ id, onClose }) => {
    const { t } = useTranslation();
    const { data, loading, error } = useGet(id ? `/api/admin/notification/${id}` : null);

    if (!id) return null;

    const getNotificationData = () => {
        if (!data) return null;
        // Handle plural/singular and array/object
        const rawNotif = data.notification || data.notifications;
        return Array.isArray(rawNotif) ? rawNotif[0] : rawNotif;
    };

    const notif = getNotificationData();

    return (
        <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                        {t("Notification Details")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("View full details of this notification")}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="py-10 text-center text-red-500">
                        {t("Failed to load details")}
                    </div>
                ) : notif ? (
                    <div className="space-y-4 pt-4">
                        <div className="bg-gray-50 p-3 rounded-lg border">
                            <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                {notif.message}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {notif.productId && (
                                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-blue-900">{t("Product")}</p>
                                        <p className="text-sm text-blue-800">{notif.productId.name} ({notif.productId.ar_name})</p>
                                    </div>
                                </div>
                            )}

                            {notif.purchaseItemId && (
                                <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                                    <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-amber-900">{t("Expiry Date")}</p>
                                        <p className="text-sm text-amber-800">
                                            {new Date(notif.purchaseItemId.date_of_expiery).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-700">{t("Created At")}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <DialogFooter className="mt-6">
                    <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                        {t("Close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationDetailModal;
