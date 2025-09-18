import { useEffect, useState } from 'react';
import API from '../services/api';

function Review() {
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const customerId = localStorage.getItem('customerId') || '64f2f...'; // demo customer

  useEffect(() => {
    // Fetch only delivered orders
    API.get(`/order/customer/${customerId}`)
      .then(res => {
        const deliveredOrders = res.data.filter(order => order.status === 'Delivered');
        setOrders(deliveredOrders);
      })
      .catch(err => console.log(err));
  }, [customerId]);

  const handleRatingChange = (orderId, value) => {
    setRatings({ ...ratings, [orderId]: value });
  };

  const handleCommentChange = (orderId, value) => {
    setComments({ ...comments, [orderId]: value });
  };

  const submitReview = async (orderId) => {
    const rating = ratings[orderId];
    const comment = comments[orderId] || '';
    if (!rating) return alert('Please select a rating');

    try {
      await API.post(`/review`, { orderId, rating, comment });
      alert('Review submitted successfully!');
    } catch (err) {
      console.log(err);
      alert('Error submitting review');
    }
  };

  const cardStyle = {
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px', color: '#ff3f6c' }}>Your Reviews</h2>

      {orders.length === 0 ? (
        <p>No delivered orders to review.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={cardStyle}>
            <h4>Order #{order._id.slice(-5)}</h4>
            <p><strong>Vendor:</strong> {order.vendorName || order.vendorId}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {order.items.map(item => (
                <div key={item.itemId} style={{ borderBottom: '1px dashed #ddd', paddingBottom: '5px' }}>
                  <p>{item.itemName}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>
                Rating:{' '}
                <select
                  value={ratings[order._id] || ''}
                  onChange={(e) => handleRatingChange(order._id, e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="1">1 ⭐</option>
                  <option value="2">2 ⭐</option>
                  <option value="3">3 ⭐</option>
                  <option value="4">4 ⭐</option>
                  <option value="5">5 ⭐</option>
                </select>
              </label>

              <div style={{ marginTop: '5px' }}>
                <textarea
                  placeholder="Leave a comment..."
                  value={comments[order._id] || ''}
                  onChange={(e) => handleCommentChange(order._id, e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
              </div>

              <button
                onClick={() => submitReview(order._id)}
                style={{
                  marginTop: '8px',
                  padding: '8px 15px',
                  backgroundColor: '#ff3f6c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Review;
