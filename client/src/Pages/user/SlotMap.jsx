import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";
import { Car, Zap, Accessibility, Crown, ChevronDown } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BookingModal from "../../Components/BookingModal";
const statusConfig = {
    available: {
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
        label: "Available",
        glow: "hover:shadow-emerald-500/20",
    },
    booked: {
        bg: "bg-amber-500/20",
        border: "border-amber-500/40",
        text: "text-amber-400",
        dot: "bg-amber-400",
        label: "Booked",
        glow: "hover:shadow-amber-500/20",
    },
    occupied: {
        bg: "bg-rose-500/20",
        border: "border-rose-500/40",
        text: "text-rose-400",
        dot: "bg-rose-400",
        label: "Occupied",
        glow: "hover:shadow-rose-500/20",
    },
    maintenance: {
        bg: "bg-zinc-500/20",
        border: "border-zinc-500/40",
        text: "text-zinc-400",
        dot: "bg-zinc-500",
        label: "Maintenance",
        glow: "",
    },
};

const typeIcons = {
    regular: Car,
    ev: Zap,
    handicap: Accessibility,
    vip: Crown,
};

export default function SlotMap({ onBookSlot }) {
    const { user } = useContext(AuthContext);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        loadSlots();
        const interval = setInterval(loadSlots, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadSlots = async () => {
        try {
            const res = await API.get("/slots");
            setSlots(res.data);
            if (!selectedFloor && res.data.length > 0) {
                const floors = [...new Set(res.data.map((s) => s.floor))].sort();
                setSelectedFloor(floors[0]);
            }
        } catch (err) {
            toast.error("Failed to load slot map");
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (slot) => {
        if (onBookSlot) {
            onBookSlot(slot._id);
        } else {
            setSelectedSlot(slot);
        }
    };

    const handleConfirmBooking = async (formData) => {
        setBookingLoading(true);
        try {
            const res = await API.post("/bookings", {
                slotId: selectedSlot._id,
                vehicleNumber: formData.vehicleNumber,
                name: formData.name,
                phone: formData.phone,
            });
            toast.success(res.data.message);
            setSelectedSlot(null);
            await loadSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || "Booking failed");
        } finally {
            setBookingLoading(false);
        }
    };

    const { floors, sections, slotsBySection, floorStats } = useMemo(() => {
        const floorSet = [...new Set(slots.map((s) => s.floor))].sort();
        const floorSlots = slots.filter((s) => s.floor === selectedFloor);
        const sectionSet = [...new Set(floorSlots.map((s) => s.section))].sort();

        const grouped = {};
        sectionSet.forEach((sec) => {
            grouped[sec] = floorSlots
                .filter((s) => s.section === sec)
                .sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
        });

        const stats = {};
        floorSet.forEach((floor) => {
            const fs = slots.filter((s) => s.floor === floor);
            stats[floor] = {
                total: fs.length,
                available: fs.filter((s) => s.status === "available").length,
                occupied: fs.filter((s) => s.status === "occupied").length,
                booked: fs.filter((s) => s.status === "booked").length,
            };
        });

        return {
            floors: floorSet,
            sections: sectionSet,
            slotsBySection: grouped,
            floorStats: stats,
        };
    }, [slots, selectedFloor]);

    const totalStats = useMemo(() => {
        return {
            total: slots.length,
            available: slots.filter((s) => s.status === "available").length,
            booked: slots.filter((s) => s.status === "booked").length,
            occupied: slots.filter((s) => s.status === "occupied").length,
            maintenance: slots.filter((s) => s.status === "maintenance").length,
        };
    }, [slots]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Parking Slot Map</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Live view of all parking slots
                    </p>
                </div>
                <button
                    onClick={loadSlots}
                    className="text-xs text-gray-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-gray-400">
                            {cfg.label} ({totalStats[key] || 0})
                        </span>
                    </div>
                ))}
            </div>

            {/* Floor Selector */}
            {floors.length > 1 && (
                <div className="flex gap-2 mb-6">
                    {floors.map((floor) => {
                        const st = floorStats[floor];
                        return (
                            <button
                                key={floor}
                                onClick={() => setSelectedFloor(floor)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${selectedFloor === floor
                                    ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                                    : "bg-zinc-900 text-gray-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                                    }`}
                            >
                                <div>Floor {floor}</div>
                                <div className="text-[10px] mt-0.5 opacity-70">
                                    {st?.available}/{st?.total} free
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Slot Grid by Section */}
            <div className="space-y-6">
                {sections.map((section) => (
                    <motion.div
                        key={section}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-5 bg-yellow-400 rounded-full" />
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                                Section {section}
                            </h3>
                            <span className="text-xs text-gray-600 ml-2">
                                {slotsBySection[section]?.filter((s) => s.status === "available").length}/
                                {slotsBySection[section]?.length} available
                            </span>
                        </div>

                        {/* Road visual */}
                        <div className="relative">
                            {/* Top row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {slotsBySection[section]?.map((slot, idx) => {
                                    const cfg = statusConfig[slot.status] || statusConfig.maintenance;
                                    const TypeIcon = typeIcons[slot.type] || Car;
                                    const isHovered = hoveredSlot === slot._id;

                                    return (
                                        <motion.div
                                            key={slot._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            onMouseEnter={() => setHoveredSlot(slot._id)}
                                            onMouseLeave={() => setHoveredSlot(null)}
                                            className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 ${cfg.bg} ${cfg.border} ${cfg.glow} ${isHovered ? "shadow-lg scale-105 z-10" : ""
                                                }`}
                                        >
                                            {/* Slot number */}
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-white">
                                                    {slot.slotNumber}
                                                </span>
                                                <TypeIcon size={12} className={cfg.text} />
                                            </div>

                                            {/* Status indicator */}
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${cfg.dot} ${slot.status === "available" ? "animate-pulse" : ""
                                                        }`}
                                                />
                                                <span className={`text-[10px] font-medium ${cfg.text}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            {/* Type label */}
                                            <div className="text-[9px] text-gray-600 mt-1 capitalize">
                                                {slot.type}
                                            </div>

                                            {/* Hover tooltip / book button */}
                                            {isHovered && slot.status === "available" && (
                                                <motion.button
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBookClick(slot);
                                                    }}
                                                    disabled={selectedSlot?._id === slot._id}
                                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-lg shadow-lg whitespace-nowrap disabled:opacity-50"
                                                >
                                                    {selectedSlot?._id === slot._id ? "..." : "Book Now"}
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Road divider */}
                            <div className="my-3 flex items-center gap-2">
                                <div className="flex-1 border-t-2 border-dashed border-zinc-700" />
                                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                                    ← Driving Lane →
                                </span>
                                <div className="flex-1 border-t-2 border-dashed border-zinc-700" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <BookingModal
                isOpen={!!selectedSlot}
                onClose={() => setSelectedSlot(null)}
                slot={selectedSlot}
                user={user}
                onConfirm={handleConfirmBooking}
                loading={bookingLoading}
            />
        </div>
    );
}
