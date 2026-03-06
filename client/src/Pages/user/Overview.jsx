import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const API = "http://localhost:5000/api";

export default function Overview() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState([
    { label: "Total Bookings", value: "—" },
    { label: "Hours Parked", value: "—" },
    { label: "Total Spent", value: "—" },
    { label: "Cancelled", value: "—" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/bookings/my`, { withCredentials: true });
        const bookings = res.data;

        const totalBookings = bookings.length;
        const cancelled = bookings.filter((b) => b.status === "cancelled").length;
        const hoursParked = bookings.reduce(
          (sum, b) => sum + (b.billId?.billableHours || 0),
          0
        );
        const totalSpent = bookings.reduce(
          (sum, b) => sum + (b.billId?.totalAmount || 0),
          0
        );

        setStats([
          { label: "Total Bookings", value: totalBookings },
          { label: "Hours Parked", value: hoursParked },
          { label: "Total Spent", value: `₹${totalSpent}` },
          { label: "Cancelled", value: cancelled },
        ]);
      } catch (err) {
        console.error("Failed to fetch booking stats:", err);
      }
    };

    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-8">
        {getGreeting()}{user?.name ? `, ${user.name}` : ""} 👋
      </h1>

      <div className="grid grid-cols-4 gap-6">

        {stats.map((s, i) => (

          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
          >

            <p className="text-zinc-400 text-sm">
              {s.label}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {s.value}
            </h2>

          </motion.div>

        ))}

      </div>

    </div>
  );
}