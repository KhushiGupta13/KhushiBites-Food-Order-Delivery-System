import { useEffect, useState } from "react";
import API from "../services/api";
import authService from "../services/authService";

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/order/customer/${user._id}`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              {order.vendorName} - {order.status} - ${order.total}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomerOrders;
