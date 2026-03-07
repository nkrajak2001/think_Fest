import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Clock,
  CheckCircle,
  Car,
  ParkingSquare,
  ArrowRight,
  User,
  AlertCircle,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
  </motion.div>
);

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

const StaffDashboard = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, active: 0, completedToday: 0, totalSlots: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [pendingRes, activeRes, slotsRes, completedRes] = await Promise.all([
        axios.get(`${API}/staff/bookings?status=pending`, { withCredentials: true }),
        axios.get(`${API}/staff/bookings?status=active`, { withCredentials: true }),
        axios.get(`${API}/slots`, { withCredentials: true }),
        axios.get(`${API}/staff/completed-today`, { withCredentials: true }),
      ]);

      setPendingBookings(pendingRes.data);
      setActiveBookings(activeRes.data);

      const totalSlots = slotsRes.data.length;

      setStats({
        pending: pendingRes.data.length,
        active: activeRes.data.length,
        completedToday: completedRes.data.count || 0,
        totalSlots,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await axios.patch(`${API}/staff/${bookingId}/checkin`, {}, { withCredentials: true });
      await fetchData();
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
      alert(`Check-out successful! Bill: ₹${res.data.bill.totalAmount} (${res.data.bill.billableHours} hrs)`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Staff Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Monitor and manage parking operations</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Clock}
          label="Pending Check-Ins"
          value={stats.pending}
          color="bg-yellow-400/10 text-yellow-400"
        />
        <StatCard
          icon={Car}
          label="Currently Occupied"
          value={stats.active}
          color="bg-green-400/10 text-green-400"
        />
        <StatCard
          icon={ParkingSquare}
          label="Total Slots"
          value={stats.totalSlots}
          color="bg-cyan-400/10 text-cyan-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Today"
          value={stats.completedToday}
          color="bg-blue-400/10 text-blue-400"
        />
      </div>

      {/* Pending Bookings — Awaiting Check-In */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase">
            Awaiting Check-In ({pendingBookings.length})
          </h3>
          <button
            onClick={() => navigate('/staff/verify')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            Verify Entry <ArrowRight size={12} />
          </button>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <AlertCircle size={16} />
            No pending bookings right now
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Slot</th>
                  <th className="text-left py-3 px-2">Vehicle</th>
                  <th className="text-left py-3 px-2">Booked At</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map((b) => (
                  <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      {b.userId?.name || '—'}
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono">
                        {b.slotId?.slotNumber || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{b.vehicleNumber}</td>
                    <td className="py-3 px-2 text-gray-500">
                      {new Date(b.bookingTime || b.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleCheckIn(b._id)}
                        disabled={actionLoading === b._id}
                        className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === b._id ? 'Processing...' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Active Bookings — Currently Parked */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase">
          Currently Parked ({activeBookings.length})
        </h3>

        {activeBookings.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <AlertCircle size={16} />
            No active vehicles right now
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Slot</th>
                  <th className="text-left py-3 px-2">Vehicle</th>
                  <th className="text-left py-3 px-2">Checked In</th>
                  <th className="text-left py-3 px-2">Duration</th>
                  <th className="text-right py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((b) => {
                  const checkIn = new Date(b.checkInTime);
                  const now = new Date();
                  const diffMin = Math.floor((now - checkIn) / 60000);
                  const hrs = Math.floor(diffMin / 60);
                  const mins = diffMin % 60;
                  const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

                  return (
                    <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-2 flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        {b.userId?.name || '—'}
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono">
                          {b.slotId?.slotNumber || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-400">{b.vehicleNumber}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {checkIn.toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-cyan-400 font-medium">{durationStr}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleCheckOut(b._id)}
                          disabled={actionLoading === b._id}
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        >
                          {actionLoading === b._id ? 'Processing...' : 'Check Out'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StaffDashboard;
