import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ParkingCircle, ClipboardList, Receipt, Map, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const nav = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "slotmap", label: "Slot Map", icon: Map },
    { id: "slots", label: "Browse Slots", icon: ParkingCircle },
    { id: "bookings", label: "My Bookings", icon: ClipboardList },
    { id: "billing", label: "Billing", icon: Receipt },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">

      <h1 className="text-xl font-bold mb-10">
        ParkIQ
      </h1>

      <div className="flex flex-col gap-2 flex-1">

        {nav.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${page === item.id
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

      {/* User info & Logout */}
      <div className="border-t border-zinc-800 pt-4 mt-4">
        <div className="text-xs text-gray-500 mb-1">Signed in as</div>
        <div className="text-sm font-medium truncate mb-3">
          {user?.name || "User"}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

    </aside>
  );
}
