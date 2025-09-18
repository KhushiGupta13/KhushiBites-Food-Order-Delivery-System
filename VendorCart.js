import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import authService from "../services/authService";

function VendorCart() {
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const res = await API.get(`/cart/vendor/${user.id || user._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCartItems(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to fetch cart items.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this item from the cart?")) return;
    try {
      const user = authService.getCurrentUser();
      await API.delete(`/cart/vendor/${user.id || user._id}/item/${itemId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Item removed from cart!");
      fetchCart();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to remove item from cart.");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const user = authService.getCurrentUser();
      await API.put(
        `/cart/vendor/${user.id || user._id}/item/${itemId}`,
        { quantity },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      fetchCart();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update quantity.");
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Vendor Cart</h2>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <div>
                <p>
                  <strong>{item.itemName}</strong> - ₹{item.price}
                </p>
                <p>Quantity: 
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    style={{ width: "60px", marginLeft: "5px" }}
                    onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                  />
                </p>
              </div>
              <button onClick={() => removeItem(item._id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ₹{totalPrice}</h3>
        </div>
      )}
    </div>
  );
}

export default VendorCart;
