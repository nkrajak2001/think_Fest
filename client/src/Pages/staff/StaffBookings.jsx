import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    User,
    Car,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    IndianRupee,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-400/10 text-yellow-400',
        active: 'bg-green-400/10 text-green-400',
        completed: 'bg-blue-400/10 text-blue-400',
        cancelled: 'bg-red-400/10 text-red-400',
        expired: 'bg-gray-400/10 text-gray-400',
    };

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[status] || 'bg-zinc-800 text-gray-400'}`}>
            {status}
        </span>
    );
};

const tabs = [
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const StaffBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchBookings = async (status = '', pageNum = 1) => {
        setLoading(true);
        try {
            const params = { page: pageNum, limit: 15 };
            if (status) params.status = status;

            const res = await axios.get(`${API}/bookings/all`, {
                params,
                withCredentials: true,
            });

            setBookings(res.data.bookings);
            setTotalPages(res.data.pages);
            setTotal(res.data.total);
            setPage(res.data.page);
        } catch (err) {
            console.error('Fetch bookings error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(activeTab, 1);
    }, [activeTab]);

    const handleCheckIn = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await axios.patch(`${API}/staff/${bookingId}/checkin`, {}, { withCredentials: true });
            await fetchBookings(activeTab, page);
        } catch (err) {
            alert(err.response?.data?.message || 'Check-in failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCheckOut = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            const res = await axios.patch(`${API}/staff/${bookingId}/checkout`, {}, { withCredentials: true });
            alert(`Check-out successful! Bill: ₹${res.data.bill.totalAmount}`);
            await fetchBookings(activeTab, page);
        } catch (err) {
            alert(err.response?.data?.message || 'Check-out failed');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">All Bookings</h1>
            <p className="text-gray-500 text-sm mb-8">View and manage all parking bookings</p>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                                : 'bg-zinc-900 text-gray-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-12 justify-center">
                        <AlertCircle size={16} />
                        No bookings found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
                                        <th className="text-left py-3 px-2">User</th>
                                        <th className="text-left py-3 px-2">Slot</th>
                                        <th className="text-left py-3 px-2">Vehicle</th>
                                        <th className="text-left py-3 px-2">Status</th>
                                        <th className="text-left py-3 px-2">Booked At</th>
                                        <th className="text-left py-3 px-2">Check-In</th>
                                        <th className="text-left py-3 px-2">Check-Out</th>
                                        <th className="text-left py-3 px-2">Bill</th>
                                        <th className="text-right py-3 px-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-500" />
                                                    <div>
                                                        <div className="font-medium">{b.userId?.name || '—'}</div>
                                                        <div className="text-xs text-gray-600">{b.userId?.email || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono">
                                                    {b.slotId?.slotNumber || '—'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Car size={14} />
                                                    {b.vehicleNumber}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="py-3 px-2 text-gray-500 text-xs">
                                                {new Date(b.createdAt).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2 text-xs">
                                                {b.checkInTime ? (
                                                    <span className="text-green-400 flex items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        {new Date(b.checkInTime).toLocaleTimeString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-xs">
                                                {b.checkOutTime ? (
                                                    <span className="text-blue-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(b.checkOutTime).toLocaleTimeString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-xs">
                                                {b.billId ? (
                                                    <div>
                                                        <span className="flex items-center gap-0.5 font-medium">
                                                            <IndianRupee size={12} />
                                                            {b.billId.totalAmount}
                                                        </span>
                                                        {b.billId.paidAt ? (
                                                            <span className="text-green-400 text-[10px]">Paid</span>
                                                        ) : (
                                                            <span className="text-yellow-400 text-[10px]">Unpaid</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCheckIn(b._id)}
                                                        disabled={actionLoading === b._id}
                                                        className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === b._id ? '...' : 'Check In'}
                                                    </button>
                                                )}
                                                {b.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCheckOut(b._id)}
                                                        disabled={actionLoading === b._id}
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === b._id ? '...' : 'Check Out'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                            <div className="text-xs text-gray-500">
                                Page {page} of {totalPages} • {total} total bookings
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchBookings(activeTab, page - 1)}
                                    disabled={page <= 1}
                                    className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => fetchBookings(activeTab, page + 1)}
                                    disabled={page >= totalPages}
                                    className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default StaffBookings;
