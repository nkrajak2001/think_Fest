import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import {
    Search,
    User,
    Car,
    CheckCircle,
    XCircle,
    IndianRupee,
    Clock,
    AlertCircle,
    Camera,
    CameraOff,
    ScanLine,
    ShieldCheck,
    ArrowRight,
    Sparkles,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
        active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
        completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
        expired: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${colors[status] || 'bg-zinc-800 text-gray-400'}`}>
            {status}
        </span>
    );
};

const FAKE_PLATES = [
    'MH12AB1234', 'KA01CD5678', 'DL05EF9012', 'UP32GH3456',
    'TN07IJ7890', 'RJ14KL2345', 'GJ06MN6789', 'MP09OP0123',
];

const VerifyEntry = () => {
    const [searchType, setSearchType] = useState('vehicleNumber');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [billInfo, setBillInfo] = useState(null);
    const [qrActive, setQrActive] = useState(false);
    const [qrResult, setQrResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const qrRef = useRef(null);
    const scannerRef = useRef(null);

    const fakeVehicleScan = () => {
        setScanning(true);
        const plate = FAKE_PLATES[Math.floor(Math.random() * FAKE_PLATES.length)];

        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            if (progress >= 100) {
                clearInterval(interval);
                setScanning(false);
                setSearchType('vehicleNumber');
                setSearchQuery(plate);
            }
        }, 15);
    };

    const startQR = async () => {
        setQrActive(true);
        setTimeout(async () => {
            try {
                const scanner = new Html5Qrcode('qr-reader');
                scannerRef.current = scanner;
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        await scanner.stop();
                        setQrActive(false);
                        scannerRef.current = null;

                        setLoading(true);
                        setSearched(true);
                        setBillInfo(null);
                        setQrResult(null);

                        try {
                            let bookingId = null;
                            let vehicle = decodedText.trim();

                            try {
                                const parsed = JSON.parse(decodedText);
                                if (parsed.bookingId) bookingId = parsed.bookingId;
                                if (parsed.vehicleNumber) vehicle = parsed.vehicleNumber;
                            } catch (e) { }

                            setSearchType('vehicleNumber');
                            setSearchQuery(vehicle);

                            if (bookingId) {
                                try {
                                    await axios.patch(
                                        `${API}/staff/${bookingId}/checkin`,
                                        {},
                                        { withCredentials: true }
                                    );
                                    setQrResult({
                                        type: 'success',
                                        message: `Check-in successful for ${vehicle.toUpperCase()}`,
                                    });
                                } catch (checkinErr) {
                                    const msg = checkinErr.response?.data?.message || 'Check-in failed';
                                    setQrResult({ type: 'error', message: msg });
                                }
                            }

                            const res = await axios.get(`${API}/staff/bookings`, {
                                params: { vehicleNumber: vehicle.toUpperCase() },
                                withCredentials: true,
                            });
                            setBookings(res.data);
                        } catch (err) {
                            console.error('QR search error:', err);
                            setBookings([]);
                        } finally {
                            setLoading(false);
                        }
                    },
                    () => { }
                );
            } catch (err) {
                console.error('Camera error:', err);
                setQrActive(false);
                alert('Could not access camera. Make sure you allow camera permissions.');
            }
        }, 100);
    };

    const stopQR = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) { }
            scannerRef.current = null;
        }
        setQrActive(false);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

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
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-cyan-400/10 rounded-xl border border-cyan-400/20">
                    <ShieldCheck size={22} className="text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Verify Entry</h1>
                    <p className="text-gray-500 text-sm">Search, scan, or verify vehicle entry</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            <Search size={14} className="text-cyan-400" />
                            Search Booking
                        </h2>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-2">
                                {['vehicleNumber', 'slotId'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setSearchType(type)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === type
                                            ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                                            : 'bg-zinc-800/50 text-gray-500 border border-zinc-700/50 hover:bg-zinc-800 hover:text-gray-300'
                                            }`}
                                    >
                                        {type === 'vehicleNumber' ? '🚗 Vehicle No.' : '🅿️ Slot No.'}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchType === 'vehicleNumber' ? 'Enter vehicle number, e.g. MH12AB1234' : 'Enter slot number, e.g. A-101'}
                                    className="w-full bg-zinc-800/70 border border-zinc-700/60 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition placeholder:text-gray-600 text-sm"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || !searchQuery.trim()}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <Search size={16} />
                                    )}
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5">
                        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            <Camera size={14} className="text-purple-400" />
                            Quick Actions
                        </h2>

                        <div className="space-y-3">
                            <button
                                onClick={qrActive ? stopQR : startQR}
                                className={`w-full p-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${qrActive
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/15'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${qrActive ? 'bg-red-500/15' : 'bg-purple-500/15'}`}>
                                    {qrActive ? <CameraOff size={16} /> : <Camera size={16} />}
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">{qrActive ? 'Stop Scanner' : 'Scan QR Code'}</div>
                                    <div className="text-[11px] opacity-60">Auto check-in via QR</div>
                                </div>
                                <ArrowRight size={14} className="ml-auto opacity-50" />
                            </button>

                            <button
                                onClick={fakeVehicleScan}
                                disabled={scanning}
                                className="w-full p-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 disabled:opacity-50"
                            >
                                <div className="p-2 rounded-lg bg-emerald-500/15">
                                    <ScanLine size={16} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold">{scanning ? 'Scanning...' : 'Scan Number Plate'}</div>
                                    <div className="text-[11px] opacity-60">AI-powered plate recognition</div>
                                </div>
                                {scanning ? (
                                    <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                ) : (
                                    <Sparkles size={14} className="ml-auto opacity-50" />
                                )}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {qrActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-zinc-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 overflow-hidden"
                            >
                                <div className="bg-black rounded-xl overflow-hidden border border-zinc-800">
                                    <div id="qr-reader" style={{ width: '100%' }} />
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                    Camera active — point at QR code
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <AnimatePresence>
                {qrResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-5 rounded-2xl p-4 flex items-center gap-3 ${qrResult.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-red-500/10 border border-red-500/20'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${qrResult.type === 'success' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                            {qrResult.type === 'success' ? (
                                <CheckCircle size={18} className="text-emerald-400" />
                            ) : (
                                <XCircle size={18} className="text-red-400" />
                            )}
                        </div>
                        <span className={`font-medium text-sm flex-1 ${qrResult.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {qrResult.message}
                        </span>
                        <button
                            onClick={() => setQrResult(null)}
                            className="text-gray-500 hover:text-white transition p-1"
                        >
                            <XCircle size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {billInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-5 bg-emerald-500/8 border border-emerald-500/15 rounded-2xl p-5"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/15 rounded-lg">
                                <CheckCircle size={18} className="text-emerald-400" />
                            </div>
                            <h3 className="text-emerald-400 font-semibold text-sm">Check-Out Complete — Bill Generated</h3>
                            <button
                                onClick={() => setBillInfo(null)}
                                className="ml-auto text-gray-500 hover:text-white transition"
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Duration', value: `${billInfo.duration} min`, icon: Clock, color: 'text-gray-300' },
                                { label: 'Billable Hours', value: `${billInfo.billableHours} hr(s)`, icon: Clock, color: 'text-gray-300' },
                                { label: 'Hourly Rate', value: `₹${billInfo.hourlyRate}`, icon: IndianRupee, color: 'text-gray-300' },
                                { label: 'Total Amount', value: `₹${billInfo.totalAmount}`, icon: IndianRupee, color: 'text-emerald-400' },
                            ].map((item) => (
                                <div key={item.label} className="bg-zinc-800/40 rounded-xl p-3">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{item.label}</div>
                                    <div className={`text-lg font-bold ${item.color} flex items-center gap-1`}>
                                        <item.icon size={14} className="opacity-50" />
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {searched && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            Results
                            <span className="bg-zinc-800 text-gray-500 text-[11px] px-2 py-0.5 rounded-full font-mono">
                                {bookings.length}
                            </span>
                        </h3>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-gray-500 text-sm py-12">
                            <AlertCircle size={24} className="opacity-30" />
                            No bookings found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-zinc-800/50">
                                        <th className="text-left py-3 px-5 font-medium">User</th>
                                        <th className="text-left py-3 px-5 font-medium">Slot</th>
                                        <th className="text-left py-3 px-5 font-medium">Vehicle</th>
                                        <th className="text-left py-3 px-5 font-medium">Status</th>
                                        <th className="text-left py-3 px-5 font-medium">Time</th>
                                        <th className="text-right py-3 px-5 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b, idx) => (
                                        <motion.tr
                                            key={b._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition"
                                        >
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-gray-500">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-200">{b.userId?.name || '—'}</div>
                                                        <div className="text-[11px] text-gray-600">{b.userId?.email || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="bg-zinc-800/80 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-300">
                                                    {b.slotId?.slotNumber || '—'}
                                                </span>
                                                <div className="text-[11px] text-gray-600 mt-1">
                                                    {b.slotId?.type} • F{b.slotId?.floor}-{b.slotId?.section}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-1.5 text-gray-300 font-mono text-xs bg-zinc-800/50 px-2.5 py-1.5 rounded-lg w-fit">
                                                    <Car size={13} className="text-gray-500" />
                                                    {b.vehicleNumber}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="py-4 px-5 text-gray-500 text-xs space-y-0.5">
                                                <div>{new Date(b.bookingTime || b.createdAt).toLocaleString()}</div>
                                                {b.checkInTime && (
                                                    <div className="text-emerald-400/80 text-[11px]">
                                                        In: {new Date(b.checkInTime).toLocaleTimeString()}
                                                    </div>
                                                )}
                                                {b.checkOutTime && (
                                                    <div className="text-blue-400/80 text-[11px]">
                                                        Out: {new Date(b.checkOutTime).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCheckIn(b._id)}
                                                        disabled={actionLoading === b._id}
                                                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                                                    >
                                                        {actionLoading === b._id ? (
                                                            <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={13} />
                                                        )}
                                                        Check In
                                                    </button>
                                                )}
                                                {b.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCheckOut(b._id)}
                                                        disabled={actionLoading === b._id}
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                                                    >
                                                        {actionLoading === b._id ? (
                                                            <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <XCircle size={13} />
                                                        )}
                                                        Check Out
                                                    </button>
                                                )}
                                                {b.status === 'completed' && b.billId && (
                                                    <div className="text-xs">
                                                        <span className="text-gray-400 font-mono">₹{b.billId.totalAmount}</span>
                                                        {b.billId.paidAt ? (
                                                            <span className="ml-2 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">Paid</span>
                                                        ) : (
                                                            <span className="ml-2 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">Unpaid</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
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
