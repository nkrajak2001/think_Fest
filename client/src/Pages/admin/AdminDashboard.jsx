import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  ParkingSquare,
  CheckCircle,
  Clock,
  IndianRupee,
  Car,
  User,
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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, bookingsRes] = await Promise.all([
          axios.get(`${API}/admin/dashboard`, { withCredentials: true }),
          axios.get(`${API}/bookings/all?limit=5`, { withCredentials: true }),
        ]);
        setStats(dashRes.data);
        setRecentBookings(bookingsRes.data.bookings);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSlots = stats?.slots
    ? Object.values(stats.slots).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of your parking system</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ParkingSquare}
          label="Total Slots"
          value={totalSlots}
          color="bg-yellow-400/10 text-yellow-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Available"
          value={stats?.slots?.available || 0}
          color="bg-green-400/10 text-green-400"
        />
        <StatCard
          icon={Clock}
          label="Active Bookings"
          value={(stats?.bookings?.pending || 0) + (stats?.bookings?.active || 0)}
          color="bg-blue-400/10 text-blue-400"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${stats?.totalRevenue || 0}`}
          color="bg-purple-400/10 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase">Slot Breakdown</h3>
          <div className="space-y-3">
            {['available', 'booked', 'occupied', 'maintenance'].map((status) => {
              const count = stats?.slots?.[status] || 0;
              const pct = totalSlots > 0 ? (count / totalSlots) * 100 : 0;
              const colors = {
                available: 'bg-green-400',
                booked: 'bg-yellow-400',
                occupied: 'bg-blue-400',
                maintenance: 'bg-red-400',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-gray-400">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${colors[status]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase">Booking Breakdown</h3>
          <div className="space-y-3">
            {['pending', 'active', 'completed', 'cancelled', 'expired'].map((status) => {
              const count = stats?.bookings?.[status] || 0;
              const totalBookings = stats?.bookings
                ? Object.values(stats.bookings).reduce((a, b) => a + b, 0)
                : 0;
              const pct = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
              const colors = {
                pending: 'bg-yellow-400',
                active: 'bg-green-400',
                completed: 'bg-blue-400',
                cancelled: 'bg-red-400',
                expired: 'bg-gray-500',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-gray-400">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${colors[status]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase">Recent Bookings</h3>
        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet</p>
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
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      {b.userId?.name || '—'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-gray-500" />
                        {b.slotId?.slotNumber || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{b.vehicleNumber}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
