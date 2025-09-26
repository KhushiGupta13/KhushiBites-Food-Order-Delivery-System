import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

function CustomerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const vendorId = query.get("vendorId");

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const socketRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) navigate("/login");
  }, [user, token, navigate]);

  // Fetch vendor menu
  useEffect(() => {
    if (!vendorId || !token) return;

    API.get(`/vendor/${vendorId}/menu`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMenu(res.data || []))
      .catch((err) => {
        console.error(err.response?.data || err);
        toast.error("Failed to load menu", { position: "top-right" });
      });
  }, [vendorId, token]);

  // Fetch customer orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await API.get(`/order`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i._id === item._id);
      let updatedCart;
      if (existing) {
        updatedCart = prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedCart = [...prevCart, { ...item, quantity: 1 }];
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.setItem("vendorId", vendorId);
      return updatedCart;
    });
    toast.success(`${item.itemName} added to cart`, { position: "top-right" });
  };

  // Go to cart page
  const goToCart = () => navigate("/cart");

  // Real-time order status updates
  useEffect(() => {
    if (!user?._id || !token) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    socketRef.current.on(`order-status-${user._id}`, (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      toast.info(
        `📦 Order ${updatedOrder._id.slice(-5)} status updated to "${updatedOrder.status}"`,
        { position: "top-right" }
      );
    });

    return () => socketRef.current.disconnect();
  }, [user, token]);

  const statusSteps = ["Ordered", "Preparing", "Out for Delivery", "Delivered"];
  const getStatusProgress = (status) => statusSteps.indexOf(status) + 1;

  // Styles
  const cardStyle = {
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "12px",
    width: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  };

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    justifyContent: "flex-start",
  };

  const buttonStyle = {
    padding: "6px 12px",
    backgroundColor: "#ff3f6c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const progressContainer = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "5px",
  };

  const progressStepStyle = (active) => ({
    width: "20%",
    height: "8px",
    backgroundColor: active ? "#28a745" : "#ccc",
    borderRadius: "4px",
  });

  const imageStyle = {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px" }}>Welcome to FoodOrder!</h2>

      {/* Menu */}
      <h2 style={{ margin: "20px 0" }}>Menu</h2>
      <div style={containerStyle}>
        {menu.length === 0 ? <p>No menu available.</p> : menu.map((item) => (
          <div key={item._id} style={cardStyle}>
            <img src={item.image || "https://via.placeholder.com/150"} alt={item.itemName} style={imageStyle} />
            <h4>{item.itemName}</h4>
            <p>{item.description}</p>
            <p style={{ fontWeight: "bold" }}>₹{item.price}</p>
            <button style={buttonStyle} onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Cart Button */}
      {cart.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <button style={buttonStyle} onClick={goToCart}>
            Go to Cart ({cart.reduce((acc, i) => acc + i.quantity, 0)})
          </button>
        </div>
      )}

      {/* Orders */}
      <h2 style={{ margin: "30px 0" }}>My Orders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {orders.length === 0 ? <p>No orders placed yet.</p> : orders.slice().reverse().map((order) => (
          <div key={order._id} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#fff" }}>
            <p><strong>Order ID:</strong> {order._id.slice(-5)}</p>
            <p><strong>Vendor:</strong> {order.vendor?.name || order.vendorId}</p>
            <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>

            {/* Progress bar */}
            <div style={progressContainer}>
              {statusSteps.map((step, idx) => (
                <div key={idx} style={progressStepStyle(idx < getStatusProgress(order.status))}></div>
              ))}
            </div>
            <p style={{ marginTop: "5px" }}><strong>Status:</strong> {order.status}</p>

            <h5>Items:</h5>
            {order.items.map((item, idx) => (
              <p key={idx}>{item.itemName} × {item.quantity} - ₹{item.price}</p>
            ))}

            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerDashboard;

