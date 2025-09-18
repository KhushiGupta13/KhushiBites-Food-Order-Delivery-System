import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";

function Menu() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vendorId = queryParams.get("vendorId");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/menu/${vendorId}`);
        setMenu(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchMenu();
  }, [vendorId]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading menu...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!menu) return <p style={{ textAlign: "center" }}>No menu found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {menu.vendor?.name} – Menu
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {menu.items.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "15px",
              width: "220px",
              textAlign: "center",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={item.image || "https://via.placeholder.com/200x150"}
              alt={item.name}
              style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px" }}
            />
            <h3>{item.name}</h3>
            <p style={{ color: "#555", fontSize: "14px" }}>{item.description}</p>
            <p style={{ fontWeight: "bold" }}>₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;
