import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

function CustomerMenu() {
  const [vendors, setVendors] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await API.get("/vendor");
        setVendors(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load vendors");
      }
    };
    fetchVendors();
  }, []);

  const addToCart = (item, vendorId) => {
    const cartItem = { ...item, vendorId, quantity: 1 };
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id && i.vendorId === vendorId);
      let updatedCart;
      if (existing) {
        updatedCart = prev.map((i) =>
          i._id === item._id && i.vendorId === vendorId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedCart = [...prev, cartItem];
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vendors & Menu</h2>
      {vendors.map((vendor) => (
        <div
          key={vendor._id}
          style={{
            border: "1px solid #ccc",
            margin: "10px",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>{vendor.name}</h3>
          {vendor.menu?.items?.length ? (
            vendor.menu.items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "5px 0",
                }}
              >
                <span>
                  {item.name} - ₹{item.price}
                </span>
                <button onClick={() => addToCart(item, vendor._id)}>Add to Cart</button>
              </div>
            ))
          ) : (
            <p>No items available</p>
          )}
        </div>
      ))}

      <h3>Cart</h3>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        cart.map((i) => (
          <p key={i._id + i.vendorId}>
            {i.name} × {i.quantity} - ₹{i.price * i.quantity}
          </p>
        ))
      )}
    </div>
  );
}

export default CustomerMenu;
