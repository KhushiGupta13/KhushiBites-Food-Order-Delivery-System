import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.signup("vendor", form.email, form.password);
      toast.success("🎉 Registration successful! Please login.", { autoClose: 2500 });
      setTimeout(() => navigate("/vendor-login"), 500);
    } catch (err) {
      toast.error(err.msg || "Registration failed", { autoClose: 2500 });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Vendor Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default VendorRegister;
