import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

function Notifications() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?._id;
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);

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

  // Fetch orders via polling
  useEffect(() => {
    if (!customerId || !token) return;

    const fetchOrders = async () => {
      try {
        const res = await API.get(`/order/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, [customerId, token]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!customerId || !token) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    socketRef.current.on(`order-status-${customerId}`, (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );

      toast.info(
        `📦 Order ${updatedOrder._id.slice(-5)} status updated to "${updatedOrder.status}"`,
        { position: "top-right" }
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [customerId, token]);

  if (!customerId) return <p>Please login to see notifications.</p>;

  return (
    <div style={{ padding: "10px", maxHeight: "300px", overflowY: "auto" }}>
      <h3>Order Notifications</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders
          .slice()
          .reverse()
          .map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                marginBottom: "5px",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <p>
                Order #{order._id.slice(-5)} - Status:{" "}
                <span style={badgeStyle(statusColors[order.status] || "#6c757d")}>
                  {order.status}
                </span>
              </p>
              <p>
                Payment Status:{" "}
                <span style={badgeStyle(paymentColors[order.paymentStatus] || "#6c757d")}>
                  {order.paymentStatus || "Pending"}
                </span>
              </p>
              {order.items?.map((item, idx) => (
                <p key={idx}>
                  {item.itemName} × {item.quantity} - ₹{item.price}
                </p>
              ))}
            </div>
          ))
      )}
    </div>
  );
}

export default Notifications;
