import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function VendorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("menu"); // Tabs: menu, orders, cart, profile

  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ itemName: "", description: "", price: "", image: "" });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItem, setEditingItem] = useState({ itemName: "", description: "", price: "", image: "" });
  const [vendor, setVendor] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const vendorId = user?.id || user?._id;
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!vendorId || !token) navigate("/login");
  }, [vendorId, token, navigate]);

  // Socket.IO setup for real-time orders
  useEffect(() => {
    if (!vendorId || !token) return;
    socketRef.current = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
    });
    socketRef.current.emit("joinVendor", vendorId);
    socketRef.current.on(`new-order-${vendorId}`, (order) => {
      toast.info(`📦 New order received: ${order._id}`, { position: "top-right" });
      setOrders((prev) => [order, ...prev]);
    });
    return () => socketRef.current.disconnect();
  }, [vendorId, token]);

  // Fetch menu
  const fetchMenu = async () => {
    try {
      const res = await API.get(`/menu/${vendorId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMenu(res.data.items || []);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to fetch menu", { position: "top-right" });
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await API.get(`/order/vendor`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to fetch orders", { position: "top-right" });
    }
  };

  // Fetch vendor profile
  const fetchVendor = async () => {
    try {
      const res = await API.get(`/vendor/${vendorId}`, { headers: { Authorization: `Bearer ${token}` } });
      setVendor(res.data);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to fetch vendor profile", { position: "top-right" });
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchOrders();
    fetchVendor();
  }, [vendorId, token]);

  // Menu operations
  const addItem = async () => {
    if (!newItem.itemName || !newItem.price) {
      toast.warning("Item name and price are required!", { position: "top-right" });
      return;
    }
    try {
      await API.post(`/menu/${vendorId}`, { ...newItem, price: Number(newItem.price) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("✅ Menu item added!", { position: "top-right" });
      setNewItem({ itemName: "", description: "", price: "", image: "" });
      fetchMenu();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("❌ Failed to add item", { position: "top-right" });
    }
  };

  const editItem = (item) => {
    setEditingItemId(item._id);
    setEditingItem({ ...item, price: Number(item.price) });
  };

  const updateItem = async () => {
    if (!editingItem.itemName || !editingItem.price) {
      toast.warning("Item name and price are required!", { position: "top-right" });
      return;
    }
    try {
      await API.put(`/menu/item/${editingItemId}`, { ...editingItem, price: Number(editingItem.price) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("✅ Menu item updated!", { position: "top-right" });
      setEditingItemId(null);
      setEditingItem({ itemName: "", description: "", price: "", image: "" });
      fetchMenu();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("❌ Failed to update item", { position: "top-right" });
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.delete(`/menu/item/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("🗑️ Menu item deleted!", { position: "top-right" });
      fetchMenu();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("❌ Failed to delete item", { position: "top-right" });
    }
  };

  // Update order status
  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/order/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.info(`Order status updated to "${status}"`, { position: "top-right" });
      fetchOrders();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("❌ Failed to update order status", { position: "top-right" });
    }
  };

  const statusColors = { Ordered: "#ffc107", Preparing: "#17a2b8", "Out for Delivery": "#007bff", Delivered: "#28a745", Cancelled: "#dc3545" };
  const paymentColors = { Paid: "#28a745", Pending: "#ffc107", Failed: "#dc3545" };
  const badgeStyle = (color) => ({ backgroundColor: color, color: "#fff", padding: "2px 6px", borderRadius: "5px", fontWeight: "bold", fontSize: "0.85rem" });

  if (!vendorId) return <p style={{ padding: "20px" }}>Please login as a vendor to access the dashboard.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Vendor Dashboard</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        {["menu", "orders", "cart", "profile"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 15px",
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === tab ? "3px solid #007bff" : "3px solid transparent",
              backgroundColor: "#f8f9fa",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "menu" && (
        <div>
          <h3>{editingItemId ? "Edit Menu Item" : "Add Menu Item"}</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
            <input placeholder="Item Name" value={editingItemId ? editingItem.itemName : newItem.itemName} onChange={(e) => editingItemId ? setEditingItem({ ...editingItem, itemName: e.target.value }) : setNewItem({ ...newItem, itemName: e.target.value })} />
            <input placeholder="Description" value={editingItemId ? editingItem.description : newItem.description} onChange={(e) => editingItemId ? setEditingItem({ ...editingItem, description: e.target.value }) : setNewItem({ ...newItem, description: e.target.value })} />
            <input placeholder="Price" type="number" value={editingItemId ? editingItem.price : newItem.price} onChange={(e) => editingItemId ? setEditingItem({ ...editingItem, price: e.target.value }) : setNewItem({ ...newItem, price: e.target.value })} />
            <input placeholder="Image URL" value={editingItemId ? editingItem.image : newItem.image} onChange={(e) => editingItemId ? setEditingItem({ ...editingItem, image: e.target.value }) : setNewItem({ ...newItem, image: e.target.value })} />
            {editingItemId ? <button onClick={updateItem}>Update Item</button> : <button onClick={addItem}>Add Item</button>}
          </div>

          {menu.length === 0 ? <p>No menu items added yet.</p> : menu.map((item) => (
            <div key={item._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "5px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              {item.image && <img src={item.image} alt={item.itemName} style={{ width: "100px", height: "80px", objectFit: "cover", borderRadius: "5px" }} />}
              <div>
                <p><strong>{item.itemName}</strong> - ₹{item.price}</p>
                <p>{item.description}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <button onClick={() => editItem(item)}>Edit</button>
                <button onClick={() => deleteItem(item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <h3>Incoming Orders</h3>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map((order) => (
            <div key={order._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Customer:</strong> {order.customer?.name || "Unknown"} ({order.customer?.email})</p>
              <p><strong>Status:</strong> <span style={badgeStyle(statusColors[order.status] || "#6c757d")}>{order.status}</span></p>
              <p><strong>Payment Status:</strong> <span style={badgeStyle(paymentColors[order.paymentStatus] || "#6c757d")}>{order.paymentStatus || "Pending"}</span></p>
              {order.razorpayPaymentId && <p><strong>Razorpay Payment ID:</strong> {order.razorpayPaymentId}</p>}
              <p><strong>Items:</strong></p>
              {order.items?.map((item, idx) => <p key={idx}>{item.itemName} × {item.quantity} - ₹{item.price}</p>)}
              <div style={{ marginTop: "5px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={() => updateStatus(order._id, "Preparing")}>Preparing</button>
                <button onClick={() => updateStatus(order._id, "Out for Delivery")}>Out for Delivery</button>
                <button onClick={() => updateStatus(order._id, "Delivered")}>Delivered</button>
                <button onClick={() => updateStatus(order._id, "Cancelled")}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "profile" && vendor && (
        <div>
          <h3>Vendor Profile</h3>
          <img src={vendor.image || "https://via.placeholder.com/250"} alt={vendor.name} style={{ width: "250px", borderRadius: "10px" }} />
          <p><strong>Name:</strong> {vendor.name}</p>
          <p><strong>Address:</strong> {vendor.address || "N/A"}</p>
          <p><strong>Contact:</strong> {vendor.contactNumber || "N/A"}</p>
          <p><strong>Cuisine:</strong> {vendor.cuisineType || "N/A"}</p>
          <p><strong>Average Rating:</strong> ⭐ {vendor.avgRating || "0"}</p>
        </div>
      )}

      {activeTab === "cart" && <p>Your cart functionality can be integrated here.</p>}
    </div>
  );
}

export default VendorDashboard;

