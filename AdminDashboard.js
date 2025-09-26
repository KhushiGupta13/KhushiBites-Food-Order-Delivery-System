import { useEffect, useState } from 'react';
import API from '../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({ usersCount: 0, vendorsCount: 0, ordersCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await API.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Admin Dashboard</h2>
      <p>Total Users: {stats.usersCount}</p>
      <p>Total Vendors: {stats.vendorsCount}</p>
      <p>Total Orders: {stats.ordersCount}</p>
    </div>
  );
}

export default AdminDashboard;
