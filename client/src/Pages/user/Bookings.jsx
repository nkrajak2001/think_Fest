import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

// Lazily loads the Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [qrBookingId, setQrBookingId] = useState(null);
  const [payLoading, setPayLoading] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await API.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    }
  };

  const cancelBooking = async (id) => {
    try {
      await API.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  const handlePay = async (booking) => {
    setPayLoading(booking._id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Razorpay SDK failed to load. Check your internet connection.");
        return;
      }

      // 1. Create order on server
      const { data } = await API.post("/payment/create-order", {
        bookingId: booking._id,
      });

      // 2. Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "SmartPark Campus",
        description: `Parking Bill — Slot ${booking.slotId?.slotNumber}`,
        order_id: data.orderId,
        theme: { color: "#22d3ee" }, // cyan-400
        handler: async (response) => {
          try {
            // 3. Verify payment on server
            await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            toast.success("Payment successful! 🎉");
            loadBookings();
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed to initiate");
    } finally {
      setPayLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-400 bg-yellow-400/10";
      case "active": return "text-green-400 bg-green-400/10";
      case "completed": return "text-blue-400 bg-blue-400/10";
      case "cancelled": return "text-red-400 bg-red-400/10";
      case "expired": return "text-gray-400 bg-gray-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <table className="w-full text-left">
        <thead className="text-zinc-400 text-sm">
          <tr>
            <th className="pb-3">Slot</th>
            <th className="pb-3">Vehicle</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Bill</th>
            <th className="pb-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <motion.tr
              key={b._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-b border-zinc-800"
            >
              <td className="py-3 font-semibold">
                {b.slotId?.slotNumber || "—"}
              </td>

              <td className="py-3 text-gray-400 text-sm">
                {b.vehicleNumber || "—"}
              </td>

              <td className="py-3">
                <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(b.status)}`}>
                  {b.status}
                </span>
              </td>

              <td className="py-3 text-sm">
                {b.billId ? (
                  <div>
                    <span className="font-bold text-green-400">₹{b.billId.totalAmount}</span>
                    <span className="text-gray-500 text-xs ml-1">
                      ({b.billId.billableHours}hr × ₹{b.billId.hourlyRate})
                    </span>
                    {b.billId.paidAt ? (
                      <span className="ml-2 text-green-400 text-xs bg-green-400/10 px-1.5 py-0.5 rounded">Paid</span>
                    ) : (
                      <span className="ml-2 text-yellow-400 text-xs bg-yellow-400/10 px-1.5 py-0.5 rounded">Unpaid</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </td>

              <td className="py-3 flex items-center gap-2">
                {/* Cancel for pending */}
                {b.status === "pending" && (
                  <button
                    onClick={() => cancelBooking(b._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Cancel
                  </button>
                )}

                {/* Pay for completed + unpaid */}
                {b.status === "completed" && b.billId && !b.billId.paidAt && (
                  <button
                    onClick={() => handlePay(b)}
                    disabled={payLoading === b._id}
                    className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1 rounded-lg text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {payLoading === b._id ? (
                      <>
                        <span className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                        Opening...
                      </>
                    ) : (
                      `Pay ₹${b.billId.totalAmount}`
                    )}
                  </button>
                )}

                {/* QR Code toggle for pending/active */}
                {(b.status === "pending" || b.status === "active") && (
                  <button
                    onClick={() => setQrBookingId(qrBookingId === b._id ? null : b._id)}
                    className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-3 py-1 rounded-lg text-xs font-medium transition"
                  >
                    {qrBookingId === b._id ? "Hide QR" : "Show QR"}
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrBookingId && (() => {
          const booking = bookings.find(b => b._id === qrBookingId);
          if (!booking) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
              onClick={() => setQrBookingId(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-1">Booking QR Code</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Show this to staff for check-in
                </p>

                <div className="bg-white rounded-xl p-4 inline-block mb-4">
                  <QRCodeSVG
                    value={booking.vehicleNumber || booking._id}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-1 text-sm">
                  <div className="text-gray-400">
                    Slot: <span className="text-white font-bold">{booking.slotId?.slotNumber}</span>
                  </div>
                  <div className="text-gray-400">
                    Vehicle: <span className="text-white font-bold">{booking.vehicleNumber}</span>
                  </div>
                </div>

                <button
                  onClick={() => setQrBookingId(null)}
                  className="mt-4 text-gray-500 hover:text-white text-sm transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}