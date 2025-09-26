import { useEffect, useState } from "react"; 
import API from "../services/api";
import { toast } from "react-toastify";
import ReviewForm from "../components/ReviewForm";
import OrderStatus from "../components/OrderStatus";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [newAddress, setNewAddress] = useState('');

  const isVendor = user?.role === "vendor";

  const fetchProfile = async () => {
    try {
      const res = isVendor
        ? await API.get(`/vendor/${user.id}`)
        : await API.get(`/customer/profile`);
      setProfile(res.data);
      setForm(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch profile data", { position: "top-right" });
    }
  };

  const fetchOrders = async () => {
    if (!isVendor) {
      try {
        const res = await API.get("/customer/orders");
        setOrders(res.data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch orders", { position: "top-right" });
      }
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const updateProfile = async () => {
    try {
      // ✅ Ensure addresses is always an array
      const updatedForm = {
        ...form,
        addresses: form.addresses || []
      };

      if (isVendor) {
        await API.put(`/vendor/${user.id}`, updatedForm);
      } else {
        await API.put("/customer/profile", updatedForm);
      }

      toast.success("✅ Profile updated successfully!", { position: "top-right" });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.log(err);
      toast.error("❌ Error updating profile", { position: "top-right" });
    }
  };

  const handleAddAddress = () => {
    if (!newAddress) return;
    const updatedAddresses = [...(form.addresses || []), newAddress];
    setForm({ ...form, addresses: updatedAddresses });
    setNewAddress('');
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = form.addresses.filter((_, i) => i !== index);
    setForm({ ...form, addresses: updatedAddresses });
  };

  const handleReorder = async (orderId) => {
    try {
      await API.post(`/customer/reorder/${orderId}`);
      toast.success("Order placed again!", { position: "top-right" });
      fetchOrders();
    } catch (err) {
      console.log(err);
      toast.error("Failed to reorder", { position: "top-right" });
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Profile</h2>

      {/* Profile Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {editing ? (
          <>
            {isVendor ? (
              <>
                <input
                  placeholder="Shop Name"
                  value={form.shopName || ""}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                />
                <input
                  placeholder="Cuisine"
                  value={form.cuisine || ""}
                  onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                />
                <input
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </>
            ) : (
              <>
                <input
                  placeholder="Name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </>
            )}

            {/* Address management */}
            <div style={{ marginTop: "10px" }}>
              <h4>Addresses:</h4>
              <ul>
                {(form.addresses || []).map((addr, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {addr}
                    <button
                      onClick={() => handleRemoveAddress(i)}
                      style={{ marginLeft: "10px", padding: "2px 6px", background: "#F44336", color: "#fff", border: "none", borderRadius: "4px" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                <input
                  type="text"
                  placeholder="Add New Address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  style={{ flex: 1, padding: "4px" }}
                />
                <button
                  onClick={handleAddAddress}
                  style={{ padding: "4px 8px", background: "#FF9800", color: "#fff", border: "none", borderRadius: "4px" }}
                >
                  Add
                </button>
              </div>
            </div>

            <button
              onClick={updateProfile}
              style={{ padding: "8px 12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "5px", marginTop: "10px" }}
            >
              Save
            </button>
          </>
        ) : (
          <>
            {isVendor ? (
              <>
                <p>Shop Name: {profile.shopName}</p>
                <p>Cuisine: {profile.cuisine}</p>
                <p>Addresses: {profile.addresses?.join(", ")}</p>
                <p>Email: {profile.email}</p>
              </>
            ) : (
              <>
                <p>Name: {profile.name}</p>
                <p>Email: {profile.email}</p>
                <p>Addresses: {profile.addresses?.join(", ")}</p>
              </>
            )}
            <button
              onClick={() => setEditing(true)}
              style={{ padding: "8px 12px", background: "#2196F3", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Past Orders Section (Customer only) */}
      {!isVendor && (
        <>
          <h2 style={{ marginTop: "30px" }}>Past Orders</h2>
          {orders.length === 0 ? (
            <p>No past orders found.</p>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order._id} style={{ marginBottom: "10px" }}>
                  <div>
                    Order #{order._id} - Total: ₹{order.total} - Status: {order.status} - Vendor: {order.vendor?.name}
                    <button
                      onClick={() => handleReorder(order._id)}
                      style={{ marginLeft: "10px", padding: "4px 8px", background: "#FF9800", color: "#fff", border: "none", borderRadius: "4px" }}
                    >
                      Reorder
                    </button>
                  </div>

                  {order.status === "Delivered" && order.vendor?._id && (
                    <ReviewForm
                      orderId={order._id}
                      vendorId={order.vendor._id}
                      onReviewPosted={fetchOrders}
                    />
                  )}

                  <OrderStatus orderId={order._id} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;
