import { motion } from "framer-motion";

export default function Overview() {

  const stats = [
    { label: "Total Bookings", value: 14 },
    { label: "Hours Parked", value: 38 },
    { label: "Total Spent", value: "₹1520" },
    { label: "Cancelled", value: 3 },
  ];

  return (
    <div>

      <h1 className="text-2xl font-bold mb-8">
        Good Morning 👋
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