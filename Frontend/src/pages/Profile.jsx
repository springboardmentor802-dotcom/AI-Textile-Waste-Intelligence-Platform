import { getCurrentUser } from '../services/api';

function Profile() {
  const user = getCurrentUser();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Profile</h2>
      <p>Name: {user?.full_name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
export default Profile;