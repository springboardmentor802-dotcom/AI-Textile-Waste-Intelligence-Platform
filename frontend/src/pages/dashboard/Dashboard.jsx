import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import useAuth from "../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
        }}
      >
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: "30px",
          }}
        >
          <h1>Welcome, {user?.name} 👋</h1>

          <hr />

          <h3>User Details</h3>

          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>Role:</strong> {user?.role}
          </p>

          <br />

          <h3>Quick Overview</h3>

          <p>
            This is your dashboard. From here you can
            manage your profile and access features
            based on your role.
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;