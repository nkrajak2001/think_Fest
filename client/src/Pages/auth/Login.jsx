/** @format */

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, User, Shield, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`,
        formData,
        { withCredentials: true },
      );

      setUser(res.data.user);

      const userRole = res.data.user.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'staff') navigate('/staff');
      else navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { name: 'user', icon: <User size={16} /> },
    { name: 'staff', icon: <Briefcase size={16} /> },
    { name: 'admin', icon: <Shield size={16} /> },
  ];

  return (
    <div className='min-h-screen flex bg-black text-white overflow-hidden'>
      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className='flex-1 flex flex-col justify-center px-20 relative'>
        <div className='absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl' />

        <div className='flex items-center gap-3 mb-16 relative z-10'>
          <div className='w-10 h-10 bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center shadow-lg'>
            P
          </div>
          <span className='text-xl font-bold tracking-wide'>ParkIQ</span>
        </div>

        <h1 className='text-5xl font-extrabold leading-tight mb-6 relative z-10'>
          Campus Parking,
          <span className='block text-yellow-400'>Reimagined.</span>
        </h1>

        <p className='text-gray-400 max-w-md mb-12 relative z-10'>
          A unified platform for booking, monitoring, and managing every parking
          slot on campus — in real time.
        </p>

        <div className='flex gap-12 relative z-10'>
          {[
            { value: '50', label: 'Total Slots' },
            { value: '3', label: 'Role Types' },
            { value: '₹1/hr', label: 'Min Billing' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}>
              <div className='text-2xl font-bold text-yellow-400'>
                {stat.value}
              </div>
              <div className='text-xs text-gray-500 uppercase'>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className='w-[460px] bg-zinc-900 border-l border-zinc-800 flex flex-col justify-center px-12'>
        <h2 className='text-2xl font-bold mb-2'>Sign In</h2>
        <p className='text-gray-400 mb-8 text-sm'>
          Access your parking dashboard
        </p>

        {/* Role Tabs */}
        <div className='flex bg-zinc-800 p-1 rounded-lg mb-8 relative'>
          <motion.div
            layout
            className='absolute top-1 bottom-1 bg-yellow-400 rounded-md'
            style={{
              width: '33.33%',
              left:
                role === 'user' ? '0%'
                : role === 'staff' ? '33.33%'
                : '66.66%',
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          {roles.map((r) => (
            <button
              key={r.name}
              onClick={() => setRole(r.name)}
              className={`flex items-center justify-center gap-2 flex-1 py-2 text-sm font-semibold relative z-10 ${
                role === r.name ? 'text-black' : 'text-gray-400'
              }`}>
              {r.icon}
              {r.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Email */}
        <div className='mb-5'>
          <label className='text-xs uppercase text-gray-400 block mb-2'>
            Email Address
          </label>
          <div className='relative'>
            <Mail
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'
            />
            <input
              type='email'
              name='email'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-yellow-400 transition'
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}
        <div className='mb-6'>
          <label className='text-xs uppercase text-gray-400 block mb-2'>
            Password
          </label>
          <div className='relative'>
            <Lock
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'
            />
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-10 py-3 text-sm outline-none focus:border-yellow-400 transition'
              value={formData.password}
              onChange={handleChange}
            />
            <div
              className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500'
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ?
                <EyeOff size={18} />
              : <Eye size={18} />}
            </div>
          </div>
        </div>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleLogin}
          disabled={loading}
          className='w-full bg-yellow-400 text-black font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition'>
          {loading ?
            'Signing In...'
          : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)} →`}
        </motion.button>

        <div className='mt-6 text-center text-xs text-gray-400'>
          No account?{' '}
          <Link
            to='/register'
            className='text-yellow-400 underline cursor-pointer'>
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
