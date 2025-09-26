import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import API from "../services/api";
import authService from "../services/authService"; 
import Logo from "../khushibites_logo.svg"; // ✅ import logo

function Home() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCuisine, setFilterCuisine] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [sortBy, setSortBy] = useState("None");
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(() => {
    return authService.getCurrentUser() || JSON.parse(localStorage.getItem("user"));
  });

  const navigate = useNavigate(); 

  const vendorExtras = {
    "Tasty Pizza": { image: "https://thumbs.dreamstime.com/b/tasty-italian-pizza-tomato-mozzarella-cheese-tasty-italian-pizza-tomato-mozzarella-cheese-arugula-wooden-background-126407516.jpg", avgRating: "4.5" },
    "Burger House": { image: "https://images.unsplash.com/photo-1550547660-d9450f859349", avgRating: "2.2" },
    "Sushi World": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-g9s-v-ShOnSO0sErIM4U6PL4cO4jF6Kovw&s", avgRating: "4.8" },
    "Curry Corner": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzaFMAfAoznROD_NJikZx05Qq6HoJUAysQVg&s", avgRating: "4.3" },
    "Vegan Delight": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwaDllN3PBD4h0f10bbRfmrzH5_AiaMcwSmA&s", avgRating: "3.8" },
    "Pasta Palace": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpjyJhcyX4bNzoXVHJgJmYVYR_MBHx4dk2JA&s", avgRating: "4.4" },
    "Mexicana Fiesta": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmnU8mOSiN0gykF9u-MCgNvwbwirm2Yn8k0A&s", avgRating: "2.1" },
    "BBQ Shack": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXX6TQ6_ZCo3k8WtU1Ks0VSX8_mDaDs10k7Q&s", avgRating: "3.5" },
    "Dim Sum House": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKKJwbK8GYjYukkBOX00TqD3jqytTF6lgMXQ&s", avgRating: "2.7" },
    "Mediterranean Magic": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_Cdi46HfepY539t6CUo4GYK7EzvVA3BJMVg&s", avgRating: "3.6" },
    "Bistro": { image: "https://media.istockphoto.com/id/908663850/photo/various-fast-food-products.jpg?s=1024x1024&w=is&k=20&c=L1ySH-gOjuoJtskRFyh0YU2pMsKlEkvY8PciyWFhC7Q=", avgRating: "4.6" },
    "Zaika Cafe And Restaurant": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIeutAysI2ABlMVPqHq-XTe-5b64QG2Pftpw&s", avgRating: "4.2" },
    "Burger King": { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoFv2jXcF0qwN9oHmbTauKTU2wtYwR5myWsA&s", avgRating: "4.3" },
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await API.get("/vendor");
        const vendorsData = res.data.map((v) => ({
          ...v,
          image: vendorExtras[v.name]?.image || v.image || "https://via.placeholder.com/250x140",
          avgRating: vendorExtras[v.name]?.avgRating || v.avgRating || "0",
        }));
        setVendors(vendorsData);
        setFilteredVendors(vendorsData);
        const uniqueCuisines = [...new Set(vendorsData.map(v => v.cuisineType).filter(Boolean))];
        setCuisines(uniqueCuisines);
        setError("");
      } catch (err) {
        console.error(err.response?.data || err);
        setError("Failed to fetch vendors. Please try again.");
      } finally { setLoading(false); }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    let results = vendors;
    if (search) results = results.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.cuisineType?.toLowerCase().includes(search.toLowerCase()));
    if (filterCuisine !== "All") results = results.filter(v => v.cuisineType === filterCuisine);
    if (filterRating !== "All") results = results.filter(v => Number(v.avgRating) >= Number(filterRating));
    if (sortBy === "rating") results = [...results].sort((a,b) => Number(b.avgRating)-Number(a.avgRating));
    else if (sortBy === "name") results = [...results].sort((a,b) => a.name.localeCompare(b.name));
    setFilteredVendors(results);
  }, [search, filterCuisine, filterRating, sortBy, vendors]);

  const handleClearFilters = () => {
    setSearch(""); setFilterCuisine("All"); setFilterRating("All"); setSortBy("None"); setFilteredVendors(vendors);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const vendorCard = { border: "1px solid #eee", borderRadius: "12px", padding: "15px", width: "250px", textAlign: "center", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", position: "relative", overflow: "hidden" };
  const vendorContainer = { display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", padding: "15px", backgroundColor: "#ff3f6c", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", flexWrap: "wrap" }}>
        {/* ✅ Logo */}
        <img src={Logo} alt="KhushiBites Logo" style={{ height: "40px", borderRadius: "8px" }} />
        
        <Link to="/" style={{ color: "white", fontWeight: "bold" }}>Home</Link>
        {!user && (<><Link to="/login" style={{ color: "white" }}>Login</Link><Link to="/signup" style={{ color: "white" }}>Signup</Link></>)}
        {user && (
          <>
            {user.role === "vendor" && (
              <>
                <Link to="/vendor-dashboard" style={{ color: "white" }}>Dashboard</Link>
                <Link to="/vendor-profile" style={{ color: "white" }}>Profile</Link>
                <Link to="/vendor-orders" style={{ color: "white" }}>Orders</Link>
                <Link to="/vendor-cart" style={{ color: "white" }}>Cart</Link>
              </>
            )}
            {user.role === "customer" && (
              <>
                <Link to="/customer-dashboard" style={{ color: "white" }}>Dashboard</Link>
                <Link to="/profile" style={{ color: "white" }}>Profile</Link>
                <Link to="/orders" style={{ color: "white" }}>Orders</Link>
                <Link to="/cart" style={{ color: "white" }}>Cart</Link>
              </>
            )}
            <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
          </>
        )}
      </nav>

      <h1 style={{ textAlign: "center", marginBottom: "20px", paddingTop: "20px", color: "#ff3f6c" }}>Food Order – Delivery System</h1>

      <div style={{ padding: "20px" }}>
        {loading ? <p>Loading vendors...</p> : error ? <p style={{ color: "red" }}>{error}</p> : (
          <div style={vendorContainer}>
            {filteredVendors.map((v) => (
              <div key={v._id} style={vendorCard}>
                <Link to={`/vendor/{v._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <img src={v.image} alt={v.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
                  <h3>{v.name}</h3>
                  <p>{v.cuisineType}</p>
                  <p>⭐ {v.avgRating}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

