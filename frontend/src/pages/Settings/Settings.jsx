import { useState } from "react";
import "./Settings.css";


function Settings() {


  const [notifications, setNotifications] = useState({

    waste: true,
    ai: true,
    reports: false

  });



  return (

    <div className="settings-page">


      <div className="settings-title">

        <h1>
          System Settings
        </h1>

        <p>
          Manage your account, notifications and platform preferences.
        </p>

      </div>





      <div className="settings-container">





        <div className="settings-box">


          <div className="settings-icon">
            👤
          </div>


          <div>

            <h2>
              Profile Settings
            </h2>

            <p className="box-description">
              Manage your account information.
            </p>


            <div className="field">

              <label>
                Username
              </label>

              <input
                value="admin"
                readOnly
              />

            </div>




            <div className="field">

              <label>
                Email
              </label>


              <input
                value="admin@textile.ai"
                readOnly
              />

            </div>


          </div>


        </div>








        <div className="settings-box">


          <div className="settings-icon">
            🎨
          </div>


          <div>

            <h2>
              Appearance
            </h2>


            <p className="box-description">
              Customize your platform experience.
            </p>




            <div className="field">

              <label>
                Theme
              </label>


              <select>

                <option>
                  Light
                </option>


              </select>


            </div>





            <div className="field">

              <label>
                Language
              </label>


              <select>

                <option>
                  English
                </option>

                <option>
                  Telugu
                </option>


              </select>


            </div>



          </div>


        </div>








        <div className="settings-box">


          <div className="settings-icon">
            🔔
          </div>


          <div>

            <h2>
              Notifications
            </h2>


            <p className="box-description">
              Control system alerts.
            </p>




            <div className="switch-row">

              <span>
                Waste Alerts
              </span>


              <input

                type="checkbox"

                checked={notifications.waste}

                onChange={()=>
                  setNotifications({
                    ...notifications,
                    waste:!notifications.waste
                  })
                }

              />

            </div>





            <div className="switch-row">

              <span>
                AI Analysis Alerts
              </span>


              <input

                type="checkbox"

                checked={notifications.ai}

                onChange={()=>
                  setNotifications({
                    ...notifications,
                    ai:!notifications.ai
                  })
                }

              />

            </div>






            <div className="switch-row">

              <span>
                Report Updates
              </span>


              <input

                type="checkbox"

                checked={notifications.reports}

                onChange={()=>
                  setNotifications({
                    ...notifications,
                    reports:!notifications.reports
                  })
                }

              />

            </div>



          </div>


        </div>








        <div className="settings-box">


          <div className="settings-icon">
            📦
          </div>


          <div>

            <h2>
              Data Management
            </h2>


            <p className="box-description">
              Export and manage platform data.
            </p>



            <button className="export-btn">

              Export Data

            </button>



          </div>


        </div>





      </div>


    </div>

  );

}


export default Settings;