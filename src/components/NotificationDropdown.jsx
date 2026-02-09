import React, { useState, useEffect } from "react";
import { Bell, X, Eye, Loader2, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import { useTranslation } from "react-i18next";
import NotificationDetailModal from "./NotificationDetailModal";
import { cn } from "@/lib/utils";

const NotificationDropdown = () => {
    const { t } = useTranslation();
    const { data, loading, refetch } = useGet("/api/admin/notification");
    const { putData } = usePut("");

    const [notifications, setNotifications] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);

    useEffect(() => {
        if (data?.notifications) {
            setNotifications(data.notifications);
        }
    }, [data]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await putData({}, `/api/admin/notification/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const handleReadAll = async () => {
        try {
            await putData({}, "/api/admin/notification/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleSeeMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const getIcon = (type) => {
        switch (type) {
            case "expired": return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case "expiry": return <Info className="w-4 h-4 text-amber-500" />;
            default: return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    const visibleNotifications = notifications.slice(0, visibleCount);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full cursor-pointer">
                        <Bell className="w-12 h-12 text-gray-600" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-1 h-6 w-6 flex items-center justify-center p-1 bg-red-500 hover:bg-red-600 border-2 border-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mr-2 bg-white/80 backdrop-blur-md border-gray-200 shadow-xl rounded-xl" align="end">
                    <div className="flex flex-col h-[450px]">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{t("Notifications")}</h3>
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 px-2 py-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={handleReadAll}
                                >
                                    {t("Mark all as read")}
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                                    <Bell className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-sm">{t("No notifications")}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {visibleNotifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={cn(
                                                "group flex gap-3 p-4 border-b last:border-0 transition-all hover:bg-gray-50/70",
                                                !notif.isRead
                                                    ? "bg-blue-50/60 border-l-4 border-l-blue-600 shadow-sm"
                                                    : "bg-white border-l-4 border-l-transparent"
                                            )}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm leading-relaxed transition-colors",
                                                    !notif.isRead ? "font-bold text-gray-900" : "text-gray-500"
                                                )}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </span>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100/50"
                                                            onClick={() => setSelectedNotificationId(notif._id)}
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            {t("Details")}
                                                        </Button>
                                                        {!notif.isRead && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                onClick={(e) => handleMarkAsRead(notif._id, e)}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {visibleCount < notifications.length && (
                                        <Button
                                            variant="ghost"
                                            className="w-full py-4 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-50 rounded-none border-t"
                                            onClick={handleSeeMore}
                                        >
                                            {t("See More")} ({notifications.length - visibleCount} {t("remaining")})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <NotificationDetailModal
                id={selectedNotificationId}
                onClose={() => setSelectedNotificationId(null)}
            />
        </>
    );
};

export default NotificationDropdown;
