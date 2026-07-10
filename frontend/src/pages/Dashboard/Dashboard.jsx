import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>
          Welcome back, {user?.username} 👋
        </h1>

        <p>
          Monitor textile waste intelligence and sustainability insights.
        </p>
      </div>


      <div className="stats-container">

        <div className="stat-card">
          <h3>Total Waste</h3>
          <p>12,450 kg</p>
        </div>


        <div className="stat-card">
          <h3>Recycled</h3>
          <p>8,320 kg</p>
        </div>


        <div className="stat-card">
          <h3>Pending Processing</h3>
          <p>2,130 kg</p>
        </div>


        <div className="stat-card">
          <h3>AI Accuracy</h3>
          <p>94%</p>
        </div>

      </div>


      <div className="dashboard-section">

        <h2>
          Recent Activity
        </h2>

        <div className="activity-card">

          <p>
            ♻️ Cotton waste classified successfully
          </p>

          <p>
            📦 New textile inventory added
          </p>

          <p>
            🤖 AI recommendation generated
          </p>

        </div>

      </div>


      <div className="dashboard-section">

        <h2>
          Sustainability Overview
        </h2>

        <div className="overview-card">

          <p>
            Carbon reduction achieved:
            <strong> 1,240 kg CO₂</strong>
          </p>

          <p>
            Waste diversion rate:
            <strong> 78%</strong>
          </p>

        </div>

      </div>


    </div>
  );
}

export default Dashboard;