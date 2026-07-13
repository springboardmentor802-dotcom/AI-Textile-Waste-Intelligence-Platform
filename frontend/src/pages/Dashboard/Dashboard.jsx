import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

import { getUsers } from "../../services/userService";
import { getInventory } from "../../services/inventoryService";
import { getUploads } from "../../services/uploadService";
import { getRecommendations } from "../../services/recommendationService";

import "./Dashboard.css";


function Dashboard() {

  const { user } = useAuth();


  const [users, setUsers] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [uploads, setUploads] = useState(0);
  const [recommendations, setRecommendations] = useState(0);



  useEffect(() => {


    getUsers()
      .then((res) => {
        setUsers(res.data.length);
      })
      .catch((error) => {
        console.error("Users Error:", error);
      });



    getInventory()
      .then((res) => {
        setInventory(res.data.length);
      })
      .catch((error) => {
        console.error("Inventory Error:", error);
      });



    getUploads()
      .then((res) => {
        setUploads(res.data.length);
      })
      .catch((error) => {
        console.error("Uploads Error:", error);
      });



    getRecommendations()
      .then((res) => {
        setRecommendations(res.data.length);
      })
      .catch((error) => {
        console.error("Recommendations Error:", error);
      });



  }, []);




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

          <h3>
            Total Users
          </h3>

          <p>
            {users}
          </p>

        </div>




        <div className="stat-card">

          <h3>
            Inventory Items
          </h3>

          <p>
            {inventory}
          </p>

        </div>




        <div className="stat-card">

          <h3>
            Waste Uploads
          </h3>

          <p>
            {uploads}
          </p>

        </div>




        <div className="stat-card">

          <h3>
            AI Recommendations
          </h3>

          <p>
            {recommendations}
          </p>

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
            <strong>
              1,240 kg CO₂
            </strong>
          </p>



          <p>
            Waste diversion rate:
            <strong>
              78%
            </strong>
          </p>



        </div>


      </div>



    </div>

  );

}


export default Dashboard;