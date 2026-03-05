import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen bg-black" />;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
