import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import authService from "../services/authService";

function VendorMenu() {
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ itemName: "", description: "", price: "", image: "" });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItem, setEditingItem] = useState({ itemName: "", description: "", price: "", image: "" });
  const token = localStorage.getItem("token");

  const fetchMenu = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;
      const res = await API.get(`/menu/${user.id || user._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMenu(res.data.items || []);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to fetch menu items.");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addItem = async () => {
    if (!newItem.itemName || !newItem.price) {
      toast.warning("Item name and price are required!");
      return;
    }
    try {
      const user = authService.getCurrentUser();
      await API.post(
        `/menu/${user.id || user._id}`,
        { ...newItem, price: Number(newItem.price) },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success("Menu item added!");
      setNewItem({ itemName: "", description: "", price: "", image: "" });
      fetchMenu();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to add menu item.");
    }
  };

  const editItem = (item) => {
    setEditingItemId(item._id);
    setEditingItem({ ...item, price: Number(item.price) });
  };

  const updateItem = async () => {
    if (!editingItem.itemName || !editingItem.price) {
      toast.warning("Item name and price are required!");
      return;
    }
    try {
      await API.put(
        `/menu/item/${editingItemId}`,
        { ...editingItem, price: Number(editingItem.price) },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success("Menu item updated!");
      setEditingItemId(null);
      setEditingItem({ itemName: "", description: "", price: "", image: "" });
      fetchMenu();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update menu item.");
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.delete(`/menu/item/${itemId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Menu item deleted!");
      fetchMenu();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to delete menu item.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Vendor Menu</h2>

      {/* Add/Edit Menu Item */}
      <div style={{ marginBottom: "30px" }}>
        <h3>{editingItemId ? "Edit Menu Item" : "Add Menu Item"}</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
          <input
            placeholder="Item Name"
            value={editingItemId ? editingItem.itemName : newItem.itemName}
            onChange={(e) =>
              editingItemId
                ? setEditingItem({ ...editingItem, itemName: e.target.value })
                : setNewItem({ ...newItem, itemName: e.target.value })
            }
          />
          <input
            placeholder="Description"
            value={editingItemId ? editingItem.description : newItem.description}
            onChange={(e) =>
              editingItemId
                ? setEditingItem({ ...editingItem, description: e.target.value })
                : setNewItem({ ...newItem, description: e.target.value })
            }
          />
          <input
            placeholder="Price"
            type="number"
            value={editingItemId ? editingItem.price : newItem.price}
            onChange={(e) =>
              editingItemId
                ? setEditingItem({ ...editingItem, price: e.target.value })
                : setNewItem({ ...newItem, price: e.target.value })
            }
          />
          <input
            placeholder="Image URL"
            value={editingItemId ? editingItem.image : newItem.image}
            onChange={(e) =>
              editingItemId
                ? setEditingItem({ ...editingItem, image: e.target.value })
                : setNewItem({ ...newItem, image: e.target.value })
            }
          />
          {editingItemId ? (
            <button onClick={updateItem}>Update Item</button>
          ) : (
            <button onClick={addItem}>Add Item</button>
          )}
        </div>

        {menu.length === 0 ? (
          <p>No menu items added yet.</p>
        ) : (
          menu.map((item) => (
            <div
              key={item._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "5px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.itemName}
                  style={{ width: "100px", height: "80px", objectFit: "cover", borderRadius: "5px" }}
                />
              )}
              <div>
                <p>
                  <strong>{item.itemName}</strong> - ₹{item.price}
                </p>
                <p>{item.description}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <button onClick={() => editItem(item)}>Edit</button>
                <button onClick={() => deleteItem(item._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VendorMenu;
