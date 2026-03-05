import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Shield, Briefcase, User } from 'lucide-react';

const API = 'http://localhost:5000/api/admin';

const roleIcons = {
  admin: Shield,
  staff: Briefcase,
  user: User,
};

const roleBadgeColors = {
  admin: 'bg-red-400/10 text-red-400',
  staff: 'bg-blue-400/10 text-blue-400',
  user: 'bg-green-400/10 text-green-400',
};

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await axios.patch(
        `${API}/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Manage Users</h1>
      <p className="text-gray-500 text-sm mb-8">{users.length} registered users</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-zinc-800">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Vehicle</th>
              <th className="text-left py-3 px-4">Active Booking</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const RoleIcon = roleIcons[u.role] || User;
              return (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                >
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-400">{u.email}</td>
                  <td className="py-3 px-4 text-gray-400">{u.vehicleNumber || '—'}</td>
                  <td className="py-3 px-4">
                    {u.hasActiveBooking ? (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-400/10 text-yellow-400">Yes</span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-zinc-800 text-gray-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium capitalize ${roleBadgeColors[u.role]}`}>
                      <RoleIcon size={12} />
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={updatingId === u._id}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-yellow-400 disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </motion.tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUser;
