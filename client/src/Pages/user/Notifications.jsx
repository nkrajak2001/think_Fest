import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";
import {
    Bell,
    CheckCircle,
    XCircle,
    Car,
    LogIn,
    LogOut as LogOutIcon,
    IndianRupee,
    AlertTriangle,
    Info,
    Trash2,
    CheckCheck,
} from "lucide-react";

const typeConfig = {
    booking: { icon: Car, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    checkin: { icon: LogIn, color: "text-green-400", bg: "bg-green-400/10" },
    checkout: { icon: LogOutIcon, color: "text-blue-400", bg: "bg-blue-400/10" },
    bill: { icon: IndianRupee, color: "text-purple-400", bg: "bg-purple-400/10" },
    payment: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    cancellation: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
    expiry: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
    info: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-400/10" },
};

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.patch(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const markAllRead = async () => {
        try {
            await API.patch("/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All marked as read");
        } catch (err) {
            toast.error("Failed to mark all as read");
        }
    };

    const deleteNotification = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            toast.success("Notification deleted");
        } catch (err) {
            toast.error("Failed to delete notification");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell size={24} />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Stay updated on your parking activity
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition"
                    >
                        <CheckCheck size={16} />
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 text-gray-500"
                >
                    <Bell size={40} className="mb-3 opacity-30" />
                    <p>No notifications yet</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {notifications.map((n, idx) => {
                            const cfg = typeConfig[n.type] || typeConfig.info;
                            const Icon = cfg.icon;

                            return (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => !n.read && markAsRead(n._id)}
                                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.read
                                            ? "bg-zinc-900/50 border-zinc-800/50"
                                            : "bg-zinc-900 border-zinc-700 hover:border-zinc-600"
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-lg ${cfg.bg} flex-shrink-0`}>
                                        <Icon size={18} className={cfg.color} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3
                                                className={`text-sm font-semibold ${n.read ? "text-gray-400" : "text-white"
                                                    }`}
                                            >
                                                {n.title}
                                            </h3>
                                            {!n.read && (
                                                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p
                                            className={`text-sm ${n.read ? "text-gray-600" : "text-gray-400"
                                                }`}
                                        >
                                            {n.message}
                                        </p>
                                        <span className="text-xs text-gray-600 mt-1 block">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(n._id);
                                        }}
                                        className="text-gray-600 hover:text-red-400 transition flex-shrink-0 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
