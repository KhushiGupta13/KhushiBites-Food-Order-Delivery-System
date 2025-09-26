import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // your backend URL

function OrderStatus({ orderId }) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchStatus();

    // Listen for real-time updates
    socket.on("orderStatusUpdate", (order) => {
      if (order._id === orderId) setStatus(order.status);
    });

    return () => {
      socket.off("orderStatusUpdate");
    };
  }, []);

  const fetchStatus = async () => {
    const res = await API.get(`/customer/orders`);
    const order = res.data.find((o) => o._id === orderId);
    if (order) setStatus(order.status);
  };

  return (
    <div className="p-2 border rounded mt-2">
      <h4>Delivery Status</h4>
      <p>{status}</p>
      <div className="flex gap-2 mt-1">
        <span className={status === "Ordered" ? "font-bold" : ""}>Ordered → </span>
        <span className={status === "Preparing" ? "font-bold" : ""}>Preparing → </span>
        <span className={status === "Out for Delivery" ? "font-bold" : ""}>Out for Delivery → </span>
        <span className={status === "Delivered" ? "font-bold" : ""}>Delivered</span>
      </div>
    </div>
  );
}

export default OrderStatus;
