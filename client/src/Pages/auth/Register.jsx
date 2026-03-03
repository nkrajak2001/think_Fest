import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Mail,
  Lock,
  User,
  Car,
  Eye,
  EyeOff,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    vehicleNumber: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        { withCredentials: true }
      );

      setUser(res.data.user);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-white overflow-hidden">
      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col justify-center px-20 relative"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 mb-16 relative z-10">
          <div className="w-10 h-10 bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center shadow-lg">
            P
          </div>
          <span className="text-xl font-bold tracking-wide">
            ParkIQ
          </span>
        </div>

        <h1 className="text-5xl font-extrabold leading-tight mb-6 relative z-10">
          Join Smart Parking,
          <span className="block text-yellow-400">
            Today.
          </span>
        </h1>

        <p className="text-gray-400 max-w-md mb-12 relative z-10">
          Create your account and start booking, managing and tracking
          your campus parking instantly.
        </p>

        <div className="flex gap-12 relative z-10">
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              Secure
            </div>
            <div className="text-xs text-gray-500 uppercase">
              Authentication
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              Fast
            </div>
            <div className="text-xs text-gray-500 uppercase">
              Booking
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              Smart
            </div>
            <div className="text-xs text-gray-500 uppercase">
              Monitoring
            </div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-[460px] bg-zinc-900 border-l border-zinc-800 flex flex-col justify-center px-12"
      >
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-gray-400 mb-8 text-sm">
          Register to access parking system
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs uppercase text-gray-400 block mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              name="name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-yellow-400 outline-none"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-xs uppercase text-gray-400 block mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              name="email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-yellow-400 outline-none"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Vehicle Number */}
        <div className="mb-4">
          <label className="text-xs uppercase text-gray-400 block mb-2">
            Vehicle Number
          </label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              name="vehicleNumber"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-yellow-400 outline-none"
              value={formData.vehicleNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-xs uppercase text-gray-400 block mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-10 py-3 text-sm focus:border-yellow-400 outline-none"
              value={formData.password}
              onChange={handleChange}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition"
        >
          {loading ? "Creating Account..." : "Register →"}
        </motion.button>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <span
            className="text-yellow-400 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;