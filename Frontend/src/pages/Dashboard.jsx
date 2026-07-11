import { useState } from 'react';
import { getCurrentUser, logoutUser, getAdminData } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  async function testAdminAccess() {
    setAdminMessage('');
    setAdminError('');
    try {
      const result = await getAdminData();
      setAdminMessage(result.message);
    } catch (err) {
      setAdminError(err.message);
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Welcome, {user?.full_name}</h2>
      <p>Role: {user?.role}</p>

      <button onClick={testAdminAccess}>Test Admin-Only Access</button>
      {adminMessage && <p style={{ color: 'green' }}>{adminMessage}</p>}
      {adminError && <p style={{ color: 'red' }}>{adminError}</p>}

      <br /><br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;