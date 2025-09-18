import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

function CustomerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.signup("customer", form.email, form.password);
      toast.success("🎉 Registration successful! Please login.", { autoClose: 2500 });
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      toast.error(err.msg || "Registration failed", { autoClose: 2500 });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Customer Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default CustomerRegister;
