import API from "./api";

const authService = {
  // ----------------- LOGIN -----------------
  login: async (email, password, role = "customer") => {
    try {
      const endpoint =
        role === "vendor" ? "/vendor/login" :
        role === "admin" ? "/admin/login" :
        "/customer/login";

      const res = await API.post(endpoint, { email, password });

      // ✅ unify response to always { token, user }
      const token = res.data.token;
      const user =
        res.data.user || res.data.vendor || res.data.customer || res.data.admin;

      if (!token || !user) throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (err) {
      throw err.response?.data || { msg: "Login failed" };
    }
  },

  // ----------------- SIGNUP -----------------
  signup: async (name, email, password, role = "customer") => {
    try {
      const endpoint =
        role === "vendor" ? "/vendor/register" : "/customer/register";

      // ✅ send name for both vendor & customer
      const payload = { name, email, password, role };

      const res = await API.post(endpoint, payload);

      const token = res.data.token;
      const user = res.data.user || res.data.vendor || res.data.customer;

      if (!token || !user) throw new Error("Invalid signup response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (err) {
      throw err.response?.data || { msg: "Signup failed" };
    }
  },

  // ----------------- LOGOUT -----------------
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // ----------------- GET CURRENT USER -----------------
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // ----------------- GET TOKEN -----------------
  getToken: () => localStorage.getItem("token"),
};

export default authService;

