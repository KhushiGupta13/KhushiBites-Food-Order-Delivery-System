import { useEffect, useState } from 'react';
import API from '../services/api';

function CustomerProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contact: '',
    addresses: [],
    paymentMethod: ''
  });

  useEffect(() => {
    const customerId = localStorage.getItem('customerId') || '64f2f...'; // replace with logged-in customer
    API.get(`/customer/${customerId}`)
      .then(res => setProfile(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const addAddress = () => {
    setProfile({ ...profile, addresses: [...profile.addresses, ''] });
  };

  const handleAddressChange = (index, value) => {
    const newAddresses = [...profile.addresses];
    newAddresses[index] = value;
    setProfile({ ...profile, addresses: newAddresses });
  };

  const saveProfile = async () => {
    try {
      await API.put(`/customer/${localStorage.getItem('customerId')}`, profile);
      alert('Profile saved!');
    } catch (err) {
      console.log(err);
      alert('Error saving profile');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Customer Profile</h2>
      <input
        placeholder="Name"
        value={profile.name}
        onChange={e => handleChange('name', e.target.value)}
      /><br/><br/>
      <input
        placeholder="Email"
        value={profile.email}
        onChange={e => handleChange('email', e.target.value)}
      /><br/><br/>
      <input
        placeholder="Contact"
        value={profile.contact}
        onChange={e => handleChange('contact', e.target.value)}
      /><br/><br/>

      <h3>Addresses</h3>
      {profile.addresses.map((addr, idx) => (
        <input
          key={idx}
          placeholder="Address"
          value={addr}
          onChange={e => handleAddressChange(idx, e.target.value)}
        />
      ))}
      <button onClick={addAddress}>Add New Address</button><br/><br/>

      <input
        placeholder="Payment Method (mock)"
        value={profile.paymentMethod}
        onChange={e => handleChange('paymentMethod', e.target.value)}
      /><br/><br/>

      <button onClick={saveProfile}>Save Profile</button>
    </div>
  );
}

export default CustomerProfile;
