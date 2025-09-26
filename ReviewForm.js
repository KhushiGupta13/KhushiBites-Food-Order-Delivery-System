import { useState } from "react";
import API from "../services/api";

function ReviewForm({ orderId, vendorId, onReviewPosted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    await API.post("/reviews", { orderId, vendorId, rating, comment });
    setComment("");
    setRating(5);
    alert("Review posted!");
    if (onReviewPosted) onReviewPosted();
  };

  return (
    <div className="p-2 border rounded mb-2">
      <h4>Post a Review</h4>
      <label>Rating:</label>
      <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <br />
      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleSubmit} className="mt-1">Submit Review</button>
    </div>
  );
}

export default ReviewForm;
