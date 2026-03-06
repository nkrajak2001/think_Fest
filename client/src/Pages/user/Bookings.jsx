import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function Bookings() {

  const [bookings, setBookings] = useState([]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >

      <h1 className="text-2xl font-bold mb-6">
        My Bookings
      </h1>

      <table className="w-full text-left">

        <thead className="text-zinc-400 text-sm">
          <tr>
            <th className="pb-3">Slot</th>
            <th>Status</th>
            <th>Action</th>
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
                {b.slotId?.slotNumber}
              </td>

              <td className="capitalize">
                {b.status}
              </td>

              <td>

                {b.status === "pending" && (

                  <button
                    onClick={() => cancelBooking(b._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Cancel
                  </button>

                )}

              </td>

            </motion.tr>

          ))}

        </tbody>

      </table>

    </motion.div>
  );
}