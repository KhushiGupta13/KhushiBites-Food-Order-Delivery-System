import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import authService from "../services/authService";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const res = await API.get(`/order/vendor`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to fetch orders.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(
        `/order/${orderId}/status`,
        { status },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success(`Order status updated to "${status}"`);
      fetchOrders();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update order status.");
    }
  };

  const statusColors = {
    Ordered: "#ffc107",
    Preparing: "#17a2b8",
    "Out for Delivery": "#007bff",
    Delivered: "#28a745",
    Cancelled: "#dc3545",
  };

  const paymentColors = {
    Paid: "#28a745",
    Pending: "#ffc107",
    Failed: "#dc3545",
  };

  const badgeStyle = (color) => ({
    backgroundColor: color,
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "0.85rem",
  });

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Vendor Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Customer:</strong> {order.customer?.name || "Unknown"} (
              {order.customer?.email})
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={badgeStyle(statusColors[order.status] || "#6c757d")}>
                {order.status}
              </span>
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span style={badgeStyle(paymentColors[order.paymentStatus] || "#6c757d")}>
                {order.paymentStatus || "Pending"}
              </span>
            </p>
            {order.razorpayPaymentId && (
              <p>
                <strong>Razorpay Payment ID:</strong> {order.razorpayPaymentId}
              </p>
            )}
            <p>
              <strong>Items:</strong>
            </p>
            {order.items?.map((item, idx) => (
              <p key={idx}>
                {item.itemName} × {item.quantity} - ₹{item.price}
              </p>
            ))}
            <div style={{ marginTop: "5px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => updateStatus(order._id, "Preparing")}>Preparing</button>
              <button onClick={() => updateStatus(order._id, "Out for Delivery")}>
                Out for Delivery
              </button>
              <button onClick={() => updateStatus(order._id, "Delivered")}>Delivered</button>
              <button onClick={() => updateStatus(order._id, "Cancelled")}>Cancel</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default VendorOrders;
