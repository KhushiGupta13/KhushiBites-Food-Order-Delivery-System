import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react"; 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfile from "./pages/VendorProfile";
import VendorMenu from "./pages/VendorMenu";
import VendorOrders from "./pages/VendorOrders";
import VendorCart from "./pages/VendorCart";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerCart from "./pages/CustomerCart";
import authService from "./services/authService";

function App() {
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser() || JSON.parse(localStorage.getItem("user"));
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser() || JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);
  }, []);

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Routes key={user ? user._id : "no-user"}>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup setUser={setUser} />} />

      {/* Vendor routes */}
      <Route
        path="/vendor-dashboard"
        element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-profile"
        element={
          <ProtectedRoute role="vendor">
            <VendorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-menu"
        element={
          <ProtectedRoute role="vendor">
            <VendorMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-orders"
        element={
          <ProtectedRoute role="vendor">
            <VendorOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-cart"
        element={
          <ProtectedRoute role="vendor">
            <VendorCart />
          </ProtectedRoute>
        }
      />

      {/* Customer routes */}
      <Route
        path="/customer-dashboard"
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="customer">
            <CustomerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute role="customer">
            <CustomerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute role="customer">
            <CustomerCart />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;

