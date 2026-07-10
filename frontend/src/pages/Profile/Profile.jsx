import { useAuth } from "../../contexts/AuthContext";
import "./Profile.css";


function Profile() {


  const { user } = useAuth();



  return (

    <div className="profile">


      <div className="profile-header">

        <h1>
          User Profile
        </h1>

        <p>
          Manage account details and platform activity.
        </p>

      </div>





      <div className="profile-card">


        <div className="profile-avatar">

          👤

        </div>



        <h2>

          {user?.username}

        </h2>



        <span>

          {user?.role}

        </span>



        <p className="active-status">

          ● Active Account

        </p>



      </div>







      <div className="profile-details">


        <div>

          <h3>
            Username
          </h3>

          <p>
            {user?.username}
          </p>

        </div>




        <div>

          <h3>
            Role
          </h3>

          <p>
            {user?.role}
          </p>

        </div>




        <div>

          <h3>
            Account Status
          </h3>

          <p>
            Active
          </p>

        </div>



      </div>








      <div className="activity-section">


        <h2>
          Activity Overview
        </h2>



        <div className="activity-cards">



          <div>

            <h3>
              Waste Entries
            </h3>

            <h2>
              24
            </h2>

          </div>




          <div>

            <h3>
              AI Predictions
            </h3>

            <h2>
              18
            </h2>

          </div>




          <div>

            <h3>
              Reports Generated
            </h3>

            <h2>
              5
            </h2>

          </div>



        </div>


      </div>




    </div>

  );

}


export default Profile;