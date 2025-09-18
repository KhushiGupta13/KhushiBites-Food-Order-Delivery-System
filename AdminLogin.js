import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Admin Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br/><br/>
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/><br/>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLogin;
