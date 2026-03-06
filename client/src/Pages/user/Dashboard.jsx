import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./dashboard/Sidebar";
import Overview from "./dashboard/Overview";
import Slots from "./dashboard/Slots";
import Bookings from "./dashboard/Bookings";
import Billing from "./dashboard/Billing";

export default function Dashboard() {
  const [page, setPage] = useState("overview");

  const renderPage = () => {
    switch (page) {
      case "slots":
        return <Slots />;
      case "bookings":
        return <Bookings />;
      case "billing":
        return <Billing />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">

      <Sidebar page={page} setPage={setPage} />

      <main className="flex-1 p-8 overflow-y-auto">

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

      </main>

    </div>
  );
}