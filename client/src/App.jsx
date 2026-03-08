import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Register from "./Pages/auth/Register";
import Login from "./Pages/auth/Login";
import Dashboard from "./Pages/user/Dashboard";
import AdminDashboard from "./Pages/admin/AdminDashboard";
import ManageSlot from "./Pages/admin/ManageSlot";
import ManageUser from "./Pages/admin/ManageUser";
import ManagePricing from "./Pages/admin/ManagePricing";
import AdminAIAssistant from "./Pages/admin/AdminAIAssistant";
import AdminInsights from "./Pages/admin/AdminInsights";
import StaffDashboard from "./Pages/staff/StaffDashboard";
import VerifyEntry from "./Pages/staff/verifyEntry";
import StaffBookings from "./Pages/staff/StaffBookings";
import StaffBilling from "./Pages/staff/StaffBilling";
import StaffSlots from "./Pages/staff/StaffSlots";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";
import AdminLayout from "./Components/AdminLayout";
import StaffRoute from "./Components/StaffRoute";
import StaffLayout from "./Components/StaffLayout";
import ChatWidget from "./Components/ChatWidget";

function App() {
  return (
    <AuthProvider>
      <ChatWidget />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/slots" element={<ManageSlot />} />
          <Route path="/admin/users" element={<ManageUser />} />
          <Route path="/admin/pricing" element={<ManagePricing />} />
          <Route path="/admin/insights" element={<AdminInsights />} />
          <Route path="/admin/ai" element={<AdminAIAssistant />} />
        </Route>

        <Route
          element={
            <StaffRoute>
              <StaffLayout />
            </StaffRoute>
          }
        >
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/verify" element={<VerifyEntry />} />
          <Route path="/staff/bookings" element={<StaffBookings />} />
          <Route path="/staff/billing" element={<StaffBilling />} />
          <Route path="/staff/slots" element={<StaffSlots />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;