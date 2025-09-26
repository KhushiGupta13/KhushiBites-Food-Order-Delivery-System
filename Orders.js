import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import { io } from "socket.io-client";

function Orders() {
  const [orders, setOrders] = useState([]);
  const customerId = localStorage.getItem("customerId");
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);

  // Fetch orders initially
  const fetchOrders = async () => {
    if (!customerId) return;
    try {
      const res = await API.get(`/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      await API.put(`/order/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.info("🛑 Order cancelled successfully");
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (err) {
      console.error("❌ Error cancelling order:", err);
      toast.error("Failed to cancel order. Try again.");
    }
  };

  // Initialize Socket.IO for real-time updates
  useEffect(() => {
    if (!customerId || !token) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    // Listen for status updates for this customer
    socketRef.current.on(`order-status-${customerId}`, (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      toast.info(`📦 Order ${updatedOrder._id.slice(-5)} status updated to ${updatedOrder.status}`);
    });

    fetchOrders(); // initial fetch

    return () => socketRef.current.disconnect();
  }, [customerId, token]);

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

  const cardStyle = {
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  };

  const itemCardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px",
    backgroundColor: "#f9f9f9",
    margin: "5px 0",
    minWidth: "120px",
  };

  const badgeStyle = (color) => ({
    backgroundColor: color,
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "0.85rem",
  });

  const cancelButtonStyle = {
    padding: "8px 12px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px", color: "#ff3f6c" }}>My Orders</h2>

      {!customerId ? (
        <p style={{ color: "red" }}>⚠️ Please log in to view your orders.</p>
      ) : orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders
          .slice()
          .reverse()
          .map((order) => (
            <div key={order._id} style={cardStyle}>
              <h4>Order #{order._id.slice(-5)}</h4>
              <p><strong>Vendor:</strong> {order.vendor?.name || order.vendorId || "Unknown Vendor"}</p>
              <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
              <p><strong>Status:</strong> <span style={badgeStyle(statusColors[order.status] || "black")}>{order.status || "Unknown"}</span></p>
              <p><strong>Payment Status:</strong> <span style={badgeStyle(paymentColors[order.paymentStatus] || "#6c757d")}>{order.paymentStatus || "Pending"}</span></p>
              {order.razorpayPaymentId && <p><strong>Payment ID:</strong> {order.razorpayPaymentId}</p>}

              <h5>Items:</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {order.items.map((item, idx) => (
                  <div key={item.itemId || item._id || idx} style={itemCardStyle}>
                    <h5>{item.itemName}</h5>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>
                ))}
              </div>

              <h5>Total: ₹{order.totalPrice}</h5>

              {order.status === "Ordered" && (
                <button style={cancelButtonStyle} onClick={() => cancelOrder(order._id)}>Cancel Order</button>
              )}
            </div>
          ))
      )}
    </div>
  );
}

export default Orders;
