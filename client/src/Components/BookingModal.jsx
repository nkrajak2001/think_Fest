import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Car } from "lucide-react";

export default function BookingModal({ isOpen, onClose, slot, user, onConfirm, loading }) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        vehicleNumber: "",
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                vehicleNumber: user.vehicleNumber || "",
            });
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold mb-1">Confirm Booking</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Slot <span className="font-bold text-white">{slot?.slotNumber}</span> ({slot?.type}) on Floor {slot?.floor}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 ml-1">
                                Driver Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 ml-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 ml-1">
                                Vehicle Number
                            </label>
                            <div className="relative">
                                <Car className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.vehicleNumber}
                                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                                    placeholder="e.g. MH12AB1234"
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-400 transition uppercase"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? "Confirming..." : "Confirm Booking"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
