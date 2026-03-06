import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";

export default function Slots() {

  const [slots, setSlots] = useState([]);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const res = await API.get("/slots");
    setSlots(res.data);
  };

  const bookSlot = async (id) => {
    try {

      const res = await API.post("/bookings", {
        slotId: id,
        vehicleNumber: "TEMP123"
      });

      toast.success(res.data.message);

      loadSlots();

    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        Browse Parking Slots
      </h1>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        className="grid grid-cols-6 gap-6"
      >

        {slots.map((slot) => (

          <motion.div
            key={slot._id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center"
          >

            <h2 className="text-lg font-bold">
              {slot.slotNumber}
            </h2>

            <p className="text-zinc-400 text-sm">
              {slot.type}
            </p>

            <p className="text-xs mt-2">
              {slot.status}
            </p>

            {slot.status === "available" && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => bookSlot(slot._id)}
                className="mt-4 bg-yellow-400 text-black px-4 py-1 rounded"
              >
                Book
              </motion.button>
            )}

          </motion.div>

        ))}

      </motion.div>

    </div>
  );
}