import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import authService from "../services/authService";

function VendorProfile() {
  const { vendorId } = useParams(); // If public view, else use current user
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        let id = vendorId;

        // If vendorId is not in params, fetch logged-in vendor
        if (!id) {
          const currentUser = authService.getCurrentUser();
          if (!currentUser) {
            setError("You must be logged in to view this profile.");
            setLoading(false);
            return;
          }
          id = currentUser._id || currentUser.id;
        }

        const res = await API.get(`/vendor/${id}`);
        setVendor(res.data);
      } catch (err) {
        console.error(err.response?.data || err);
        setError("Failed to fetch vendor profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!vendor) return <p>Vendor not found.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>{vendor.name}</h2>
      <img
        src={vendor.image || "https://via.placeholder.com/250"}
        alt={vendor.name}
        style={{ width: "250px", borderRadius: "10px", marginBottom: "15px" }}
      />
      <p><strong>Address:</strong> {vendor.address || "N/A"}</p>
      <p><strong>Contact:</strong> {vendor.contactNumber || "N/A"}</p>
      <p><strong>Cuisine:</strong> {vendor.cuisineType || "N/A"}</p>
      <p><strong>Average Rating:</strong> ⭐ {vendor.avgRating || "0"}</p>
    </div>
  );
}

export default VendorProfile;
