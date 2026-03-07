import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  Clock,
  Receipt,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Car,
  ParkingCircle,
} from "lucide-react";

const StatusBadge = ({ paid }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paid
        ? "bg-green-400/10 text-green-400"
        : "bg-yellow-400/10 text-yellow-400"
      }`}
  >
    {paid ? "Paid" : "Unpaid"}
  </span>
);

export default function Billing() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const res = await API.get("/bookings/my");
      const completed = res.data.filter(
        (b) => b.status === "completed" && b.billId
      );
      setBookings(completed);
    } catch (err) {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (bookingId) => {
    setPayingId(bookingId);
    try {
      await API.patch(`/bookings/${bookingId}/pay`);
      toast.success("Payment successful!");
      await loadBillingData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "unpaid") return !b.billId?.paidAt;
    if (filter === "paid") return !!b.billId?.paidAt;
    return true;
  });

  const totalBilled = bookings.reduce(
    (sum, b) => sum + (b.billId?.totalAmount || 0),
    0
  );
  const totalPaid = bookings
    .filter((b) => b.billId?.paidAt)
    .reduce((sum, b) => sum + (b.billId?.totalAmount || 0), 0);
  const totalUnpaid = totalBilled - totalPaid;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Billing & Receipts</h1>
      <p className="text-gray-500 text-sm mb-8">
        View your parking bills and make payments
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold">₹{totalBilled}</div>
          <div className="text-xs text-gray-500 uppercase mt-1">
            Total Billed
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold">₹{totalPaid}</div>
          <div className="text-xs text-gray-500 uppercase mt-1">Total Paid</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold">₹{totalUnpaid}</div>
          <div className="text-xs text-gray-500 uppercase mt-1">
            Outstanding
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "All Bills" },
          { key: "unpaid", label: "Unpaid" },
          { key: "paid", label: "Paid" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === tab.key
                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                : "bg-zinc-900 text-gray-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bills List */}
      {filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center"
        >
          <Receipt className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-500">
            {filter === "all"
              ? "No bills yet. Complete a parking session to see your bills here."
              : `No ${filter} bills found.`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b, idx) => {
            const bill = b.billId;
            const isExpanded = expandedId === b._id;

            return (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
              >
                {/* Bill Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : b._id)}
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-zinc-800/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Receipt size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Slot {b.slotId?.slotNumber || "—"}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(b.checkOutTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {bill?.billableHours} hr(s)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Car size={10} />
                          {b.vehicleNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold flex items-center gap-0.5">
                        <IndianRupee size={14} />
                        {bill?.totalAmount}
                      </div>
                    </div>
                    <StatusBadge paid={!!bill?.paidAt} />
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-zinc-800"
                    >
                      <div className="px-5 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Check-In
                            </div>
                            <div className="text-sm font-medium">
                              {new Date(b.checkInTime).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Check-Out
                            </div>
                            <div className="text-sm font-medium">
                              {new Date(b.checkOutTime).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Duration
                            </div>
                            <div className="text-sm font-medium">
                              {bill?.duration} min ({bill?.billableHours}{" "}
                              billable hr
                              {bill?.billableHours > 1 ? "s" : ""})
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Rate
                            </div>
                            <div className="text-sm font-medium">
                              ₹{bill?.hourlyRate} / hr
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Slot Type
                            </div>
                            <div className="text-sm font-medium capitalize flex items-center gap-1">
                              <ParkingCircle size={12} />
                              {b.slotId?.type || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Location
                            </div>
                            <div className="text-sm font-medium">
                              Floor {b.slotId?.floor}, Section{" "}
                              {b.slotId?.section}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Total Amount
                            </div>
                            <div className="text-sm font-bold text-yellow-400 flex items-center gap-0.5">
                              <IndianRupee size={12} />
                              {bill?.totalAmount}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Payment Status
                            </div>
                            {bill?.paidAt ? (
                              <div className="text-sm text-green-400 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Paid on{" "}
                                {new Date(bill.paidAt).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="text-sm text-yellow-400">
                                Awaiting Payment
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pay Button */}
                        {!bill?.paidAt && (
                          <div className="flex justify-end pt-2 border-t border-zinc-800">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePay(b._id);
                              }}
                              disabled={payingId === b._id}
                              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50"
                            >
                              <IndianRupee size={14} />
                              {payingId === b._id
                                ? "Processing..."
                                : `Pay ₹${bill?.totalAmount}`}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}