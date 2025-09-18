import { useEffect, useState } from "react";
import API from "../services/api";

function VendorReviews({ vendorId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const res = await API.get(`/reviews/vendor/${vendorId}`);
    setReviews(res.data);
  };

  return (
    <div>
      <h3>Customer Reviews</h3>
      {reviews.map((rev) => (
        <div key={rev._id} className="border p-2 mb-2">
          <p><strong>{rev.customer.name}</strong> - Rating: {rev.rating}</p>
          <p>{rev.comment}</p>
          {rev.vendorResponse && <p><em>Vendor Response: {rev.vendorResponse}</em></p>}
        </div>
      ))}
    </div>
  );
}

export default VendorReviews;
