import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  IndianRupee,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const tabs = [
  { key: '', label: 'All' },
  { key: 'false', label: 'Unpaid' },
  { key: 'true', label: 'Paid' },
];

const StaffBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBills = async (paid = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 15 };
      if (paid) params.paid = paid;

      const res = await axios.get(`${API}/staff/billing`, {
        params,
        withCredentials: true,
      });

      setBills(res.data.bills);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
      setPage(res.data.page);
    } catch (err) {
      console.error('Fetch bills error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(activeTab, 1);
  }, [activeTab]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Billing Records</h1>
      <p className="text-gray-500 text-sm mb-8">View all billing and payment records</p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                : 'bg-zinc-900 text-gray-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-12 justify-center">
            <AlertCircle size={16} />
            No billing records found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-left py-3 px-2">Vehicle</th>
                    <th className="text-left py-3 px-2">Duration</th>
                    <th className="text-left py-3 px-2">Hours</th>
                    <th className="text-left py-3 px-2">Rate</th>
                    <th className="text-left py-3 px-2">Total</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-500" />
                          <div>
                            <div className="font-medium">{bill.userId?.name || '—'}</div>
                            <div className="text-xs text-gray-600">{bill.userId?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-400">
                        {bill.bookingId?.vehicleNumber || '—'}
                      </td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
                          {bill.duration} min
                        </span>
                      </td>
                      <td className="py-3 px-2 text-cyan-400 font-medium">
                        {bill.billableHours} hr
                      </td>
                      <td className="py-3 px-2 text-gray-400">
                        ₹{bill.hourlyRate}/hr
                      </td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-0.5 font-bold text-green-400">
                          <IndianRupee size={14} />
                          {bill.totalAmount}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {bill.paidAt ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-md w-fit">
                            <CheckCircle size={12} /> Paid
                          </span>
                        ) : (
                          <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-1 rounded-md w-fit">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">
                        {new Date(bill.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
              <div className="text-xs text-gray-500">
                Page {page} of {totalPages} • {total} total bills
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchBills(activeTab, page - 1)}
                  disabled={page <= 1}
                  className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => fetchBills(activeTab, page + 1)}
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

export default StaffBilling;
