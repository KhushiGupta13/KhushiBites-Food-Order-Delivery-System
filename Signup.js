import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

function Signup({ setUser }) { // accept setUser from App.js
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.signup(name, email, password, role);

      // store user in localStorage
      if (user?.token && user?.user) {
        localStorage.setItem("token", user.token);
        localStorage.setItem("user", JSON.stringify(user.user));
        if (setUser) setUser(user.user);
      }

      toast.success(`Account created! Welcome, ${user.user?.name || name}`, {
        autoClose: 2000,
        theme: "colored",
      });

      // Redirect based on role after signup
      if (user.user?.role === "vendor") navigate("/vendor-dashboard");
      else if (user.user?.role === "customer") navigate("/customer-dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.message || "Signup failed", { autoClose: 2500, theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #eee", borderRadius: "10px", backgroundColor: "#fff" }}>
      <h2 style={{ textAlign: "center", color: "#ff3f6c" }}>Signup</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
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
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#ff3f6c", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account? <Link to="/login" style={{ color: "#ff3f6c" }}>Login</Link>
      </p>
    </div>
  );
}

export default Signup;



