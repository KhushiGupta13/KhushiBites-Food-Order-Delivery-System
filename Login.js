import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

function Login({ setUser }) {   // receives setUser from App.js
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // default role
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(email, password, role);

      // ✅ Save token and user in localStorage
      if (response?.token && response?.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        if (setUser) setUser(response.user); // update App state
      } else {
        throw new Error("Invalid login response");
      }

      toast.success(`Welcome back, ${response.user.name || "User"}!`, {
        autoClose: 2000,
        theme: "colored",
      });

      // ✅ Redirect based on role
      if (response.user.role === "vendor") navigate("/vendor-dashboard");
      else if (response.user.role === "customer") navigate("/customer-dashboard");
      else if (response.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/"); // fallback
    } catch (err) {
      toast.error(err.message || "Login failed", {
        autoClose: 2500,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "10px",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#ff3f6c" }}>Login</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ff3f6c",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don&apos;t have an account?{" "}
        <Link to="/signup" style={{ color: "#ff3f6c" }}>
          Signup
        </Link>
      </p>
    </div>
  );
}

export default Login;

