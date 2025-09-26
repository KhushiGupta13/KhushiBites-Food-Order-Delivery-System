import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    API.get("/order", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to fetch orders"));
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Order History</h2>
      {orders.length === 0 ? (
        <p>No past orders</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "15px",
              padding: "12px",
              borderRadius: "6px",
              background: "#fafafa",
            }}
          >
            <p>
              <b>Vendor:</b> {order.vendor?.name || "Unknown Vendor"}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  color: "white",
                  backgroundColor:
                    order.status === "Cancelled"
                      ? "red"
                      : order.status === "Delivered"
                      ? "green"
                      : "#ff9800",
                }}
              >
                {order.status}
              </span>
            </p>
            <p>
              <b>Payment:</b>{" "}
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  color: "white",
                  backgroundColor:
                    order.paymentStatus === "Paid"
                      ? "green"
                      : order.paymentStatus === "Refunded"
                      ? "red"
                      : "gray",
                }}
              >
                {order.paymentStatus}
              </span>
            </p>
            <p>
              <b>Items:</b>
            </p>
            {order.items.map((i, idx) => (
              <p key={idx}>
                {i.itemName} × {i.quantity} – ₹{i.price * i.quantity}
              </p>
            ))}
            <p>
              <b>Total:</b> ₹{order.totalPrice}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;
