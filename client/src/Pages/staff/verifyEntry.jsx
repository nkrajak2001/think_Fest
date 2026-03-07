import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Search,
    User,
    Car,
    CheckCircle,
    XCircle,
    IndianRupee,
    Clock,
    AlertCircle,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

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

const VerifyEntry = () => {
    const [searchType, setSearchType] = useState('vehicleNumber');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [billInfo, setBillInfo] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearched(true);
        setBillInfo(null);

        try {
            const params = {};
            if (searchType === 'vehicleNumber') {
                params.vehicleNumber = searchQuery.trim();
            } else {
                params.slotId = searchQuery.trim();
            }

            const res = await axios.get(`${API}/staff/bookings`, {
                params,
                withCredentials: true,
            });

            setBookings(res.data);
        } catch (err) {
            console.error('Search error:', err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await axios.patch(`${API}/staff/${bookingId}/checkin`, {}, { withCredentials: true });
            const params = {};
            if (searchType === 'vehicleNumber') {
                params.vehicleNumber = searchQuery.trim();
            } else {
                params.slotId = searchQuery.trim();
            }
            const res = await axios.get(`${API}/staff/bookings`, { params, withCredentials: true });
            setBookings(res.data);
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
            setBillInfo(res.data.bill);

            const params = {};
            if (searchType === 'vehicleNumber') {
                params.vehicleNumber = searchQuery.trim();
            } else {
                params.slotId = searchQuery.trim();
            }
            const searchRes = await axios.get(`${API}/staff/bookings`, { params, withCredentials: true });
            setBookings(searchRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Check-out failed');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">Verify Entry</h1>
            <p className="text-gray-500 text-sm mb-8">Search bookings and manage check-in / check-out</p>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6"
            >
                <form onSubmit={handleSearch} className="flex gap-3 items-end">
                    <div className="flex-shrink-0">
                        <label className="block text-xs text-gray-500 uppercase mb-2">Search By</label>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-cyan-400 transition"
                        >
                            <option value="vehicleNumber">Vehicle Number</option>
                            <option value="slotId">Slot Number</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 uppercase mb-2">
                            {searchType === 'vehicleNumber' ? 'Vehicle Number' : 'Slot Number'}
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={searchType === 'vehicleNumber' ? 'e.g. MH12AB1234' : 'e.g. A-101'}
                            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-cyan-400 hover:bg-cyan-300 text-black font-medium px-6 py-2.5 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Search size={16} />
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </motion.div>

            {/* Bill Info Banner */}
            <AnimatePresence>
                {billInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 mb-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="text-green-400" size={20} />
                            <h3 className="text-green-400 font-semibold">Check-Out Successful — Bill Generated</h3>
                            <button
                                onClick={() => setBillInfo(null)}
                                className="ml-auto text-gray-500 hover:text-white transition"
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs text-gray-500 uppercase mb-1">Duration</div>
                                <div className="text-lg font-bold flex items-center gap-1">
                                    <Clock size={16} className="text-gray-400" />
                                    {billInfo.duration} min
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase mb-1">Billable Hours</div>
                                <div className="text-lg font-bold">{billInfo.billableHours} hr(s)</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase mb-1">Rate</div>
                                <div className="text-lg font-bold">₹{billInfo.hourlyRate}/hr</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase mb-1">Total Amount</div>
                                <div className="text-lg font-bold text-green-400 flex items-center gap-1">
                                    <IndianRupee size={16} />
                                    {billInfo.totalAmount}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Results */}
            {searched && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                >
                    <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase">
                        Search Results ({bookings.length})
                    </h3>

                    {bookings.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm py-6 justify-center">
                            <AlertCircle size={16} />
                            No bookings found for this search
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
                                        <th className="text-left py-3 px-2">User</th>
                                        <th className="text-left py-3 px-2">Slot</th>
                                        <th className="text-left py-3 px-2">Vehicle</th>
                                        <th className="text-left py-3 px-2">Status</th>
                                        <th className="text-left py-3 px-2">Time</th>
                                        <th className="text-right py-3 px-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                            <td className="py-3 px-2 flex items-center gap-2">
                                                <User size={14} className="text-gray-500" />
                                                <div>
                                                    <div>{b.userId?.name || '—'}</div>
                                                    <div className="text-xs text-gray-600">{b.userId?.email || ''}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono">
                                                    {b.slotId?.slotNumber || '—'}
                                                </span>
                                                <div className="text-xs text-gray-600 mt-0.5">
                                                    {b.slotId?.type} • {b.slotId?.floor}-{b.slotId?.section}
                                                </div>
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
                                                <div>Booked: {new Date(b.bookingTime || b.createdAt).toLocaleString()}</div>
                                                {b.checkInTime && (
                                                    <div className="text-green-400">In: {new Date(b.checkInTime).toLocaleTimeString()}</div>
                                                )}
                                                {b.checkOutTime && (
                                                    <div className="text-blue-400">Out: {new Date(b.checkOutTime).toLocaleTimeString()}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCheckIn(b._id)}
                                                        disabled={actionLoading === b._id}
                                                        className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === b._id ? 'Processing...' : 'Check In'}
                                                    </button>
                                                )}
                                                {b.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCheckOut(b._id)}
                                                        disabled={actionLoading === b._id}
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === b._id ? 'Processing...' : 'Check Out'}
                                                    </button>
                                                )}
                                                {b.status === 'completed' && b.billId && (
                                                    <div className="text-xs text-gray-500">
                                                        ₹{b.billId.totalAmount}
                                                        {b.billId.paidAt ? (
                                                            <span className="text-green-400 ml-1">Paid</span>
                                                        ) : (
                                                            <span className="text-yellow-400 ml-1">Unpaid</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default VerifyEntry;
