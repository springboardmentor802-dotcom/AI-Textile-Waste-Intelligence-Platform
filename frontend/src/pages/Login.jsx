import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await loginUser(formData);

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      console.log(err.response);

      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Textile Waste Intelligence Platform
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded mb-4"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-3 rounded mb-4"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <p className="text-red-600 mb-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-700 text-white p-3 rounded hover:bg-green-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;