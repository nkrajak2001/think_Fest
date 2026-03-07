import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { IndianRupee, Zap, Accessibility, Crown, Car } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin`;

const typeConfig = {
  regular: { icon: Car, color: 'from-zinc-700 to-zinc-600', accent: 'text-gray-300', border: 'border-zinc-700' },
  ev: { icon: Zap, color: 'from-emerald-600/20 to-emerald-500/10', accent: 'text-emerald-400', border: 'border-emerald-500/30' },
  handicap: { icon: Accessibility, color: 'from-blue-600/20 to-blue-500/10', accent: 'text-blue-400', border: 'border-blue-500/30' },
  vip: { icon: Crown, color: 'from-purple-600/20 to-purple-500/10', accent: 'text-purple-400', border: 'border-purple-500/30' },
};

const allTypes = ['regular', 'ev', 'handicap', 'vip'];

const ManagePricing = () => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editRate, setEditRate] = useState('');

  const fetchPricing = async () => {
    try {
      const res = await axios.get(`${API}/pricing`, { withCredentials: true });
      setPricing(res.data);
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const getRate = (slotType) => {
    const p = pricing.find((r) => r.slotType === slotType);
    return p ? p.hourlyRate : null;
  };

  const handleSave = async (slotType) => {
    const rate = parseFloat(editRate);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid rate');
      return;
    }
    try {
      await axios.post(
        `${API}/pricing`,
        { slotType, hourlyRate: rate },
        { withCredentials: true }
      );
      setEditing(null);
      fetchPricing();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pricing');
    }
  };

  const startEdit = (type) => {
    setEditing(type);
    setEditRate(getRate(type) || '');
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
      <h1 className="text-2xl font-bold mb-1">Pricing</h1>
      <p className="text-gray-500 text-sm mb-8">Set hourly rates for each slot type</p>

      <div className="grid grid-cols-2 gap-4">
        {allTypes.map((type, i) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const rate = getRate(type);
          const isEditing = editing === type;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${config.color} border ${config.border} rounded-xl p-6`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center ${config.accent}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold capitalize text-lg">{type}</h3>
                  <p className="text-xs text-gray-400">Parking Slot</p>
                </div>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2 mt-4">
                  <div className="relative flex-1">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-full bg-black/30 border border-zinc-700 rounded-lg pl-8 pr-4 py-2 text-sm outline-none focus:border-yellow-400"
                      placeholder="Rate per hour"
                      autoFocus
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSave(type)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Save
                  </motion.button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-gray-400 hover:text-white text-sm px-2 py-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    <IndianRupee size={20} className={config.accent} />
                    <span className="text-3xl font-bold">{rate ?? '—'}</span>
                    <span className="text-gray-400 text-sm">/hr</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startEdit(type)}
                    className="text-xs bg-black/30 border border-zinc-700 px-3 py-1.5 rounded-lg hover:border-yellow-400 transition"
                  >
                    {rate ? 'Edit' : 'Set Rate'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ManagePricing;
