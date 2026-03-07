import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Car,
  Zap,
  ParkingCircle,
  Wrench,
  CheckCircle,
  AlertCircle,
  Crown,
  Accessibility,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const StaffSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await axios.get(`${API}/staff/slots`, { params, withCredentials: true });
      setSlots(res.data);
    } catch (err) {
      console.error('Fetch slots error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filter]);

  const toggleMaintenance = async (slotId, currentStatus) => {
    setActionLoading(slotId);
    try {
      const endpoint = currentStatus === 'maintenance'
        ? `${API}/staff/slots/${slotId}/activate`
        : `${API}/staff/slots/${slotId}/maintenance`;
      await axios.patch(endpoint, {}, { withCredentials: true });
      await fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ev': return <Zap size={16} className="text-blue-400" />;
      case 'vip': return <Crown size={16} className="text-yellow-400" />;
      case 'handicap': return <Accessibility size={16} className="text-purple-400" />;
      default: return <Car size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/10';
      case 'booked': return 'text-yellow-400 bg-yellow-400/10';
      case 'occupied': return 'text-orange-400 bg-orange-400/10';
      case 'maintenance': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const tabs = [
    { key: '', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'booked', label: 'Booked' },
    { key: 'occupied', label: 'Occupied' },
    { key: 'maintenance', label: 'Maintenance' },
  ];

  const counts = {
    available: slots.filter(s => filter === '' ? true : false).length === 0 ? slots.filter(s => s.status === 'available').length : '',
    maintenance: slots.filter(s => s.status === 'maintenance').length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Slot Management</h1>
      <p className="text-gray-500 text-sm mb-8">View all slots and toggle maintenance mode</p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.key
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                : 'bg-zinc-900 text-gray-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {slots.map((slot, index) => (
            <motion.div
              key={slot._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center"
            >
              <div className="text-base font-bold mb-1 font-mono">{slot.slotNumber}</div>

              <div className="flex items-center gap-1 text-xs mb-1">
                {getIcon(slot.type)}
                <span className="text-gray-400 capitalize">{slot.type}</span>
              </div>

              <div className="text-xs text-gray-600 mb-2">
                Floor {slot.floor} • {slot.section}
              </div>

              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md mb-3 ${getStatusColor(slot.status)}`}>
                {slot.status}
              </span>

              {(slot.status === 'available' || slot.status === 'maintenance') && (
                <button
                  onClick={() => toggleMaintenance(slot._id, slot.status)}
                  disabled={actionLoading === slot._id}
                  className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                    slot.status === 'maintenance'
                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                  }`}
                >
                  {actionLoading === slot._id
                    ? '...'
                    : slot.status === 'maintenance'
                    ? '✓ Activate'
                    : '⚙ Maintenance'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffSlots;
