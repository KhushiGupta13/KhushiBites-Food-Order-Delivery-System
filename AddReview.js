import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

function AddReview({ orderId, vendorId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const submitReview = async () => {
    try {
      await API.post("/review", {
        orderId,
        customerId: user._id,
        vendorId,
        rating,
        comment,
      });
      toast.success("Review submitted");
      setComment("");
    } catch (err) {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Leave a Review</h4>
      <select value={rating} onChange={e => setRating(e.target.value)}>
        {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a review..." />
      <button onClick={submitReview}>Submit</button>
    </div>
  );
}

export default AddReview;
