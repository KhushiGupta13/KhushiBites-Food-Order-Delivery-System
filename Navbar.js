import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import authService from "../services/authService";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    toast.success("✅ Logged out successfully!", { position: "top-right", autoClose: 3000, theme: "colored" });
    setTimeout(() => navigate("/"), 1200);
  };

  return (
    <nav
      style={{
        padding: "10px 20px",
        backgroundColor: "#ff3f6c",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* ✅ Logo + App name */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src="/logo.png" // 👉 place your logo file inside "public/logo.png"
          alt="App Logo"
          style={{ height: "40px", width: "40px", borderRadius: "50%", objectFit: "cover" }}
        />
        <h2 style={{ fontFamily: "Arial, sans-serif", cursor: "pointer" }}>
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            FoodOrder
          </Link>
        </h2>
      </div>

      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            color: "white",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      )}

      <div
        style={{
          display: isMobile ? (isOpen ? "flex" : "none") : "flex",
          gap: "15px",
          flexDirection: isMobile ? "column" : "row",
          width: isMobile ? "100%" : "auto",
          alignItems: "center",
        }}
      >
        {user && (
          <>
            {user.role === "vendor" && (
              <>
                <Link to="/vendor-dashboard" style={{ color: "white", textDecoration: "none" }}>
                  Dashboard
                </Link>
                <Link to="/vendor/menu" style={{ color: "white", textDecoration: "none" }}>
                  Manage Menu
                </Link>
                <Link to="/vendor/orders" style={{ color: "white", textDecoration: "none" }}>
                  Orders
                </Link>
              </>
            )}
            {user.role === "customer" && (
              <>
                <Link to="/customer-dashboard" style={{ color: "white", textDecoration: "none" }}>
                  Dashboard
                </Link>
                <Link to="/customer-menu" style={{ color: "white", textDecoration: "none" }}>
                  Menu
                </Link>
                <Link to="/orders" style={{ color: "white", textDecoration: "none" }}>
                  Orders
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link to="/admin-dashboard" style={{ color: "white", textDecoration: "none" }}>
                Admin Dashboard
              </Link>
            )}

            <Link to="/profile" style={{ color: "white", textDecoration: "none" }}>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "red",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

