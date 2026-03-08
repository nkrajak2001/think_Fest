import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Clock,
  ParkingSquare,
  Zap,
  RefreshCw,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = {
  available: '#4ade80',
  booked: '#facc15',
  occupied: '#60a5fa',
  maintenance: '#f87171',
  regular: '#818cf8',
  ev: '#34d399',
  handicap: '#fbbf24',
  vip: '#f472b6',
  pending: '#facc15',
  active: '#4ade80',
  completed: '#60a5fa',
  cancelled: '#f87171',
  expired: '#6b7280',
};

const PIE_COLORS = ['#4ade80', '#facc15', '#60a5fa', '#f87171', '#818cf8', '#f472b6'];

const ChartCard = ({ title, icon: Icon, children, span = 1 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 ${span === 2 ? 'col-span-2' : ''}`}
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue')
            ? `₹${entry.value.toLocaleString()}`
            : entry.value}
        </p>
      ))}
    </div>
  );
};

const AdminInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/insights`, { withCredentials: true });
      setData(res.data);
    } catch (err) {
      console.error('Insights fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <p>Failed to load insights data.</p>
        <button onClick={fetchInsights} className="mt-3 text-yellow-400 hover:underline text-sm">Retry</button>
      </div>
    );
  }

  // Shorten date labels for charts
  const shortDate = (d) => {
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  };

  const revenueTrend = data.revenueTrend.map((d) => ({ ...d, label: shortDate(d.date) }));
  const bookingsTrend = data.bookingsTrend.map((d) => ({ ...d, label: shortDate(d.date) }));
  const forecastData = [
    ...data.revenueTrend.slice(-7).map((d) => ({ label: shortDate(d.date), actual: d.revenue })),
    ...data.forecast.map((d) => ({ label: shortDate(d.date), predicted: d.predicted })),
  ];

  // Summary stats
  const totalRevenue30d = data.revenueTrend.reduce((a, d) => a + d.revenue, 0);
  const totalBookings30d = data.bookingsTrend.reduce((a, d) => a + d.pending + d.active + d.completed + d.cancelled + d.expired, 0);
  const peakHour = data.peakHours.reduce((max, h) => h.count > max.count ? h : max, { count: 0 });
  const avgDaily = Math.round(totalRevenue30d / 30);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Insights</h1>
          <p className="text-gray-500 text-sm">Business analytics & predictive analysis</p>
        </div>
        <button
          onClick={fetchInsights}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '30-Day Revenue', value: `₹${totalRevenue30d.toLocaleString()}`, color: 'text-green-400' },
          { label: '30-Day Bookings', value: totalBookings30d, color: 'text-blue-400' },
          { label: 'Peak Hour', value: peakHour.label || '—', color: 'text-purple-400' },
          { label: 'Avg Daily Rev', value: `₹${avgDaily.toLocaleString()}`, color: 'text-yellow-400' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend (30 Days)" icon={TrendingUp} span={2}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#4ade80" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="collected" name="Collected" stroke="#60a5fa" fill="url(#colGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Daily Bookings */}
        <ChartCard title="Daily Bookings (30 Days)" icon={BarChart3} span={2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bookingsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 0, 0]} />
              <Bar dataKey="active" name="Active" stackId="a" fill={COLORS.active} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={COLORS.pending} />
              <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill={COLORS.cancelled} />
              <Bar dataKey="expired" name="Expired" stackId="a" fill={COLORS.expired} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peak Hours */}
        <ChartCard title="Peak Hours (Check-in Distribution)" icon={Clock}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#6b7280' }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Check-ins" fill="#818cf8" radius={[4, 4, 0, 0]}>
                {data.peakHours.map((entry, i) => (
                  <Cell key={i} fill={entry.count === peakHour.count && entry.count > 0 ? '#fbbf24' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Slot Utilization */}
        <ChartCard title="Slot Utilization (Live)" icon={ParkingSquare}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.slotUtilization}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.slotUtilization.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => <span className="text-gray-400 capitalize">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Slot Type Distribution */}
        <ChartCard title="Slot Type Distribution" icon={ParkingSquare}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.slotTypes}
                cx="50%"
                cy="50%"
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.slotTypes.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Forecast */}
        <ChartCard title="7-Day Revenue Forecast" icon={Zap}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" name="Actual Revenue" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#fbbf24' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

export default AdminInsights;
