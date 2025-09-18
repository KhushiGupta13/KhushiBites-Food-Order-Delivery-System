import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [vendorId, setVendorId] = useState(cart[0]?.vendorId || "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const socketRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Initialize Socket.IO
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    if (user?.role === "customer") {
      socketRef.current.emit("joinRoom", { role: "customer", id: user._id });
    }

    return () => socketRef.current.disconnect();
  }, [token, user]);

  // 👉 Place order + trigger mock payment
  const placeOrder = async () => {
    if (!cart.length) return toast.warning("Cart is empty");
    if (!address) return toast.warning("Please enter delivery address");

    setLoading(true);
    try {
      const items = cart.map((i) => ({
        itemName: i.itemName,
        price: i.price,
        quantity: i.quantity,
      }));

      // 1️⃣ Place order
      const res = await API.post(
        "/order",
        { vendorId, items, deliveryAddress: address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = res.data.order;
      toast.success("🛒 Order placed!");

      // 2️⃣ Trigger mock payment
      const payRes = await API.post(
        `/payment/pay/${order._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (payRes.data.order?.paymentStatus === "Paid") {
        toast.success("✅ Payment successful (mock)!");

        // ✅ Trigger real-time notifications via Socket.IO
        socketRef.current.emit("notifyVendor", {
          vendorId,
          message: `New paid order received from ${user?.name}`,
        });

        socketRef.current.emit("notifyCustomer", {
          customerId: user?._id,
          message: "Your payment was successful! Order confirmed 🎉",
        });
      } else {
        toast.error("⚠️ Payment failed (mock)");
      }

      // 3️⃣ Clear cart + redirect
      localStorage.removeItem("cart");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.map((i) => (
            <p key={i._id}>
              {i.itemName} × {i.quantity} - ₹{i.price * i.quantity}
            </p>
          ))}
          <p>
            <strong>Total: ₹{total}</strong>
          </p>

          <textarea
            placeholder="Enter delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: "100%", height: "80px", margin: "10px 0" }}
          />

          <button
            onClick={placeOrder}
            disabled={!cart.length || loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ff3f6c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {loading ? "Processing..." : "Place Order & Pay (Mock)"}
          </button>
        </>
      )}
    </div>
  );
}

export default Checkout;
