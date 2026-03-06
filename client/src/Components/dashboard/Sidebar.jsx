import { Home, ParkingCircle, ClipboardList, Receipt } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ page, setPage }) {

  const nav = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "slots", label: "Browse Slots", icon: ParkingCircle },
    { id: "bookings", label: "My Bookings", icon: ClipboardList },
    { id: "billing", label: "Billing", icon: Receipt },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">

      <h1 className="text-xl font-bold mb-10">
        ParkIQ
      </h1>

      <div className="flex flex-col gap-2">

        {nav.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                page === item.id
                  ? "bg-yellow-400 text-black"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </motion.button>
          );
        })}

      </div>

    </aside>
  );
}