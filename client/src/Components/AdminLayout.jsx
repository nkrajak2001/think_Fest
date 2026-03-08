import { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ParkingSquare,
  Users,
  BadgeDollarSign,
  LogOut,
  Bot,
  BarChart3,
  Activity,
} from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/slots', label: 'Manage Slots', icon: ParkingSquare },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/pricing', label: 'Pricing', icon: BadgeDollarSign },
  { to: '/admin/insights', label: 'Insights', icon: BarChart3 },
  { to: '/admin/monitor', label: 'Staff Monitor', icon: Activity },
  { to: '/admin/ai', label: 'AI Assistant', icon: Bot },
];

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full z-20"
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-800">
          <div className="w-9 h-9 bg-yellow-400 text-black font-bold rounded-lg flex items-center justify-center text-sm">
            P
          </div>
          <span className="text-lg font-bold tracking-wide">ParkIQ</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? 'bg-yellow-400/10 text-yellow-400'
                  : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <div className="text-xs text-gray-500 mb-1">Signed in as</div>
          <div className="text-sm font-medium truncate mb-3">
            {user?.name || 'Admin'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition w-full"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 ml-60 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
