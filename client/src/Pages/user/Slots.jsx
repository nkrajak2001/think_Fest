import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Car, Zap, ParkingCircle } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BookingModal from "../../Components/BookingModal";

export default function Slots() {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const res = await API.get("/slots");
      setSlots(res.data);
    } catch (err) {
      toast.error("Failed to load parking slots");
    }
  };

  const handleConfirmBooking = async (formData) => {
    try {
      setLoading(true);
      const res = await API.post("/bookings", {
        slotId: selectedSlot._id,
        vehicleNumber: formData.vehicleNumber,
        name: formData.name,
        phone: formData.phone,
      });
      toast.success(res.data.message);
      setSelectedSlot(null);
      loadSlots();
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === "ev") return <Zap size={18} />;
    if (type === "bike") return <ParkingCircle size={18} />;
    return <Car size={18} />;
  };

  return (
    <div className="p-8">

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-8"
      >
        Browse Parking Slots
      </motion.h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">

        {slots.map((slot, index) => (

          <motion.div
            key={slot._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center"
          >

            <div className="text-lg font-bold mb-1">
              {slot.slotNumber}
            </div>

            <div className="flex items-center gap-1 text-zinc-400 text-sm mb-1">
              {getIcon(slot.type)}
              {slot.type}
            </div>

            <div
              className={`text-xs mb-4 font-semibold ${slot.status === "available"
                  ? "text-green-400"
                  : "text-red-400"
                }`}
            >
              {slot.status}
            </div>

            {slot.status === "available" ? (

              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={loading}
                onClick={() => setSelectedSlot(slot)}
                className="bg-yellow-400 text-black px-4 py-1 rounded font-semibold hover:bg-yellow-300"
              >
                Book
              </motion.button>

            ) : (

              <button
                disabled
                className="bg-zinc-700 text-zinc-400 px-4 py-1 rounded cursor-not-allowed"
              >
                Unavailable
              </button>

            )}

          </motion.div>

        ))}

      </div>

      <BookingModal
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        slot={selectedSlot}
        user={user}
        onConfirm={handleConfirmBooking}
        loading={loading}
      />
    </div>
  );
}