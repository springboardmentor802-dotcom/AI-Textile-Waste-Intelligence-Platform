import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import API from "../../api/axios";
import "./Login.css";


function Login() {

  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || "");
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


    console.log(
      "LOGIN RESPONSE:",
      response.data
    );


    const user = {

      username: username,

      role: response.data.role,

      access_token: response.data.access_token

    };



    // check role

    if (
      user.role.toLowerCase() !== role.toLowerCase()
    ) {

      setError(
        "Selected role does not match account role"
      );

      return;

    }



    // save token + user

    login(user);



    navigate("/dashboard");



  }

  catch(error){

    console.log(
      error.response
    );


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

          {location.state?.message && (
            <div className="form-message success-message" role="status">
              {location.state.message}
            </div>
          )}



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

          <p className="auth-switch">
            New to the platform? <Link to="/register">Create an account</Link>
          </p>


        </div>


      </div>


    </div>

  );

}


export default Login;
