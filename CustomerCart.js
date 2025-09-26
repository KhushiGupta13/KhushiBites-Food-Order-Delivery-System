import { useEffect, useState } from "react";
import API from "../services/api";
import authService from "../services/authService";

function CustomerCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/cart/customer/${user._id}`);
        setCartItems(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch cart items.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCart();
  }, [user]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Cart</h2>
      {loading ? (
        <p>Loading cart items...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item._id}>
              {item.menuItemName} - {item.quantity} x ${item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomerCart;


