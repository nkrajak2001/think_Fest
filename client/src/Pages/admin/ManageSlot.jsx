import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  Power,
  X,
  Search,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors = {
  available: 'bg-green-400/10 text-green-400',
  booked: 'bg-yellow-400/10 text-yellow-400',
  occupied: 'bg-blue-400/10 text-blue-400',
  maintenance: 'bg-red-400/10 text-red-400',
};

const typeColors = {
  regular: 'bg-zinc-700 text-gray-300',
  ev: 'bg-emerald-400/10 text-emerald-400',
  handicap: 'bg-blue-400/10 text-blue-400',
  vip: 'bg-purple-400/10 text-purple-400',
};

const ManageSlot = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [filters, setFilters] = useState({ status: '', type: '', floor: '' });
  const [form, setForm] = useState({ slotNumber: '', type: 'regular', floor: '', section: '' });

  const fetchSlots = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.floor) params.floor = filters.floor;

      const res = await axios.get(`${API}/slots`, { params, withCredentials: true });
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filters]);

  const openCreate = () => {
    setEditSlot(null);
    setForm({ slotNumber: '', type: 'regular', floor: '', section: '' });
    setShowModal(true);
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setForm({ slotNumber: slot.slotNumber, type: slot.type, floor: slot.floor, section: slot.section });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editSlot) {
        await axios.put(`${API}/slots/${editSlot._id}`, form, { withCredentials: true });
      } else {
        await axios.post(`${API}/slots`, form, { withCredentials: true });
      }
      setShowModal(false);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save slot');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await axios.delete(`${API}/slots/${id}`, { withCredentials: true });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete slot');
    }
  };

  const handleMaintenance = async (id) => {
    try {
      await axios.patch(`${API}/slots/${id}/maintenance`, {}, { withCredentials: true });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.patch(`${API}/slots/${id}/activate`, {}, { withCredentials: true });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
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
          <h1 className="text-2xl font-bold">Manage Slots</h1>
          <p className="text-gray-500 text-sm">{slots.length} slots total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-semibold text-sm"
        >
          <Plus size={16} />
          Add Slot
        </motion.button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400"
        >
          <option value="">All Types</option>
          <option value="regular">Regular</option>
          <option value="ev">EV</option>
          <option value="handicap">Handicap</option>
          <option value="vip">VIP</option>
        </select>
        <input
          type="text"
          placeholder="Filter by floor..."
          value={filters.floor}
          onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 w-40"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
              <th className="text-left py-3 px-4">Slot</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Floor</th>
              <th className="text-left py-3 px-4">Section</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <motion.tr
                key={slot._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
              >
                <td className="py-3 px-4 font-medium">{slot.slotNumber}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${typeColors[slot.type]}`}>
                    {slot.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">{slot.floor}</td>
                <td className="py-3 px-4 text-gray-400">{slot.section}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${statusColors[slot.status]}`}>
                    {slot.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(slot)} className="p-1.5 rounded-md hover:bg-zinc-800 text-gray-400 hover:text-white transition">
                      <Pencil size={14} />
                    </button>
                    {slot.status === 'available' && (
                      <>
                        <button onClick={() => handleMaintenance(slot._id)} className="p-1.5 rounded-md hover:bg-zinc-800 text-gray-400 hover:text-yellow-400 transition" title="Set Maintenance">
                          <Wrench size={14} />
                        </button>
                        <button onClick={() => handleDelete(slot._id)} className="p-1.5 rounded-md hover:bg-zinc-800 text-gray-400 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {slot.status === 'maintenance' && (
                      <button onClick={() => handleActivate(slot._id)} className="p-1.5 rounded-md hover:bg-zinc-800 text-gray-400 hover:text-green-400 transition" title="Activate">
                        <Power size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
            {slots.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No slots found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-[420px]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{editSlot ? 'Edit Slot' : 'Create Slot'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-gray-400 block mb-2">Slot Number</label>
                  <input
                    type="text"
                    value={form.slotNumber}
                    onChange={(e) => setForm({ ...form, slotNumber: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
                    placeholder="e.g. A-101"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-gray-400 block mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
                  >
                    <option value="regular">Regular</option>
                    <option value="ev">EV</option>
                    <option value="handicap">Handicap</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase text-gray-400 block mb-2">Floor</label>
                    <input
                      type="text"
                      value={form.floor}
                      onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
                      placeholder="e.g. G"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 block mb-2">Section</label>
                    <input
                      type="text"
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
                      placeholder="e.g. A"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="w-full bg-yellow-400 text-black font-bold py-2.5 rounded-lg mt-6 text-sm"
              >
                {editSlot ? 'Update Slot' : 'Create Slot'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageSlot;
