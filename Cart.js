import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";

function Cart() {
  const [cart, setCart] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [total, setTotal] = useState(0);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Load cart and total
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedVendor = localStorage.getItem("vendorId");
    setCart(storedCart);
    setVendorId(storedVendor);
    calculateTotal(storedCart);
  }, []);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    setTotal(totalPrice);
  };

  const updateQuantity = (index, change) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[index].quantity = Math.max(1, (newCart[index].quantity || 1) + change);
      localStorage.setItem("cart", JSON.stringify(newCart));
      calculateTotal(newCart);
      return newCart;
    });
  };

  // Load Razorpay SDK
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Handle payment
  const handlePayment = async () => {
    if (!address.trim()) {
      toast.error("⚠️ Please enter a delivery address");
      return;
    }

    if (cart.length === 0) {
      toast.warning("Your cart is empty!");
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    if (!user?._id || !token) {
      toast.error("⚠️ Please login again.");
      navigate("/login");
      return;
    }

    const orderItems = cart.map((item) => ({
      itemId: item._id,
      itemName: item.itemName,
      quantity: item.quantity || 1,
      price: item.price,
    }));

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // 🔑 Replace with your Razorpay Key
      amount: total * 100, // in paise
      currency: "INR",
      name: "Food Order App",
      description: "Food Order Payment",
      handler: async function (response) {
        try {
          await API.post(
            "/order",
            {
              customerId: user._id,
              vendorId,
              items: orderItems,
              deliveryAddress: address,
              totalPrice: total,
              paymentStatus: "Paid",
              razorpayPaymentId: response.razorpay_payment_id,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          toast.success("🎉 Order placed & paid successfully!");
          localStorage.removeItem("cart");
          setCart([]);
          setTimeout(() => navigate("/orders"), 1000);
        } catch (err) {
          console.log(err);
          toast.error("❌ Error placing order. Try again.");
        }
      },
      prefill: {
        name: user?.name || "Customer",
        email: user?.email || "customer@example.com",
        contact: user?.phone || "9999999999",
      },
      theme: { color: "#ff3f6c" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px" }}>Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cart.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={item.image || "https://via.placeholder.com/80"}
                alt={item.itemName}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div style={{ flex: 1 }}>
                <h4>{item.itemName}</h4>
                <p>₹{item.price}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button onClick={() => updateQuantity(index, -1)}>-</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(index, 1)}>+</button>
                </div>
              </div>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>

          <input
            type="text"
            placeholder="Enter delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={handlePayment}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ff3f6c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Place Order & Pay
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
