import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import API from "../../api/axios";
import "./Login.css";


function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { login } = useAuth();



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    try {

      const response = await API.post(
        "/auth/login",

        new URLSearchParams({
          username: username,
          password: password,
        }),

        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );


      const user = response.data;

      console.log("LOGIN RESPONSE:", user);



      // Check selected role with database role
      if (
        user.role.toLowerCase() !== role.toLowerCase()
      ) {

        setError(
          "Selected role does not match account role"
        );

        return;

      }



      // Save user data
      login(user);



      // Go to dashboard
      navigate("/dashboard");



    } catch (error) {

      console.log(error.response);

      setError(
        "Invalid username or password"
      );

    }

  };



  return (

    <div className="login-page">


      <div className="login-left">

        <div className="brand">

          <h1>
            AI Textile Waste Intelligence Platform
          </h1>


          <p>
            Transforming textile waste into sustainable intelligence through AI.
          </p>


          <ul className="features">

            <li>
              ✔ AI Waste Classification
            </li>

            <li>
              ✔ Textile Inventory Management
            </li>

            <li>
              ✔ Smart Analytics Dashboard
            </li>

            <li>
              ✔ Sustainability Recommendations
            </li>

          </ul>


        </div>

      </div>




      <div className="login-right">

        <div className="login-card">


          <h2>
            Welcome Back
          </h2>


          <p>
            Login to continue
          </p>



          {error && (

            <p style={{color:"red"}}>
              {error}
            </p>

          )}



          <form onSubmit={handleSubmit}>


            <div className="form-group">

              <label>
                Username
              </label>


              <div className="input-box">

                <FaUser className="input-icon"/>


                <input

                  type="text"

                  placeholder="Enter your username"

                  value={username}

                  onChange={(e)=>
                    setUsername(e.target.value)
                  }

                  required

                />

              </div>

            </div>




            <div className="form-group">

              <label>
                Password
              </label>


              <div className="input-box">

                <FaLock className="input-icon"/>


                <input

                  type="password"

                  placeholder="Enter your password"

                  value={password}

                  onChange={(e)=>
                    setPassword(e.target.value)
                  }

                  required

                />

              </div>

            </div>




            <div className="form-group">

              <label>
                Role
              </label>


              <select

                value={role}

                onChange={(e)=>
                  setRole(e.target.value)
                }

                required

              >

                <option value="">
                  Select Role
                </option>


                <option value="Admin">
                  Admin
                </option>


                <option value="Industry">
                  Industry
                </option>


                <option value="Recycler">
                  Recycler
                </option>


                <option value="NGO">
                  NGO
                </option>


              </select>


            </div>




            <button type="submit">

              Login

            </button>



          </form>


        </div>


      </div>


    </div>

  );

}


export default Login;