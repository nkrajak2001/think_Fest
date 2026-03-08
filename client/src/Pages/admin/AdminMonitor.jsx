import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Users,
    Shield,
    LogIn,
    LogOut,
    Clock,
    Car,
    User,
    RefreshCw,
    Activity,
    Circle,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function timeAgo(date) {
    if (!date) return 'Never';
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
}

export default function AdminMonitor() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const load = async () => {
        try {
            const res = await axios.get(`${API}/admin/monitor`, { withCredentials: true });
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load monitor data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        if (autoRefresh) {
            const interval = setInterval(load, 15000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { summary, staffList, todayActivity } = data || {};

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                        <Activity size={22} className="text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Staff Monitor</h1>
                        <p className="text-gray-500 text-sm">Live staff activity and duty status</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition border ${autoRefresh
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-zinc-800 text-gray-500 border-zinc-700'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                        {autoRefresh ? 'Live' : 'Paused'}
                    </button>
                    <button
                        onClick={load}
                        className="text-xs text-gray-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Staff', value: summary?.totalStaff || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
                    { label: 'On Duty Today', value: summary?.onDuty || 0, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                    { label: 'Check-Ins Today', value: summary?.todayCheckins || 0, icon: LogIn, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
                    { label: 'Check-Outs Today', value: summary?.todayCheckouts || 0, icon: LogOut, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`${stat.bg} border ${stat.border} rounded-2xl p-4`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon size={18} className={stat.color} />
                            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-zinc-800/80">
                        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Users size={14} className="text-yellow-400" />
                            Staff Roster
                            <span className="bg-zinc-800 text-gray-500 text-[11px] px-2 py-0.5 rounded-full font-mono ml-auto">
                                {staffList?.length || 0}
                            </span>
                        </h2>
                    </div>

                    <div className="divide-y divide-zinc-800/50 max-h-[500px] overflow-y-auto">
                        {staffList?.length === 0 ? (
                            <div className="text-gray-500 text-sm text-center py-8">No staff registered</div>
                        ) : (
                            staffList?.map((staff) => (
                                <div key={staff._id} className="px-5 py-3.5 hover:bg-zinc-800/20 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <User size={16} className="text-gray-500" />
                                            </div>
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${staff.onDuty ? 'bg-emerald-400' : 'bg-gray-600'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-200 truncate">{staff.name}</div>
                                            <div className="text-[11px] text-gray-600 truncate">{staff.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[11px] font-semibold ${staff.onDuty ? 'text-emerald-400' : 'text-gray-600'}`}>
                                                {staff.onDuty ? 'On Duty' : 'Off Duty'}
                                            </div>
                                            <div className="text-[10px] text-gray-600">
                                                {staff.todayActions} today
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-2 ml-12">
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <LogIn size={10} className="text-emerald-500/60" />
                                            {staff.totalCheckins} ins
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <LogOut size={10} className="text-amber-500/60" />
                                            {staff.totalCheckouts} outs
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <Clock size={10} />
                                            {timeAgo(staff.lastActivity)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-zinc-800/80">
                        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Clock size={14} className="text-yellow-400" />
                            Today's Activity Feed
                            <span className="bg-zinc-800 text-gray-500 text-[11px] px-2 py-0.5 rounded-full font-mono ml-auto">
                                {todayActivity?.length || 0} events
                            </span>
                        </h2>
                    </div>

                    {todayActivity?.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-gray-500 text-sm py-12">
                            <Activity size={24} className="opacity-30" />
                            No activity recorded today
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-zinc-900">
                                    <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-zinc-800/50">
                                        <th className="text-left py-3 px-5 font-medium">Time</th>
                                        <th className="text-left py-3 px-5 font-medium">Staff</th>
                                        <th className="text-left py-3 px-5 font-medium">Action</th>
                                        <th className="text-left py-3 px-5 font-medium">User</th>
                                        <th className="text-left py-3 px-5 font-medium">Vehicle</th>
                                        <th className="text-left py-3 px-5 font-medium">Slot</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayActivity?.map((a, idx) => (
                                        <motion.tr
                                            key={a._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition"
                                        >
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                                                        <Shield size={11} className="text-yellow-400/60" />
                                                    </div>
                                                    <span className="text-gray-300 text-xs font-medium">{a.staffId?.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${a.action === 'checkin'
                                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                                        }`}
                                                >
                                                    {a.action === 'checkin' ? <LogIn size={11} /> : <LogOut size={11} />}
                                                    {a.action === 'checkin' ? 'Check In' : 'Check Out'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="text-xs text-gray-300">{a.userId?.name || '—'}</div>
                                                <div className="text-[10px] text-gray-600">{a.userId?.email || ''}</div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono bg-zinc-800/50 px-2.5 py-1 rounded-lg w-fit">
                                                    <Car size={11} className="text-gray-500" />
                                                    {a.vehicleNumber}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="bg-zinc-800/80 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-300">
                                                    {a.slotId?.slotNumber || '—'}
                                                </span>
                                                <div className="text-[10px] text-gray-600 mt-0.5">
                                                    {a.slotId?.type} • F{a.slotId?.floor}-{a.slotId?.section}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
