import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      console.log(err.response);

      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo / Title */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            ♻️
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            Textile Intelligence
          </h1>

          <p className="text-gray-500 mt-2">
            AI-powered textile waste analysis
          </p>

        </div>

        {/* Login Form */}

        <form onSubmit={handleSubmit}>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 p-3 rounded-lg mb-4
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="w-full border border-gray-300 p-3 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Forgot Password */}

          <div className="text-right mt-2 mb-5">

            <Link
              to="/forgot-password"
              className="text-sm text-green-700 hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Error */}

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* Login Button */}

          <button
            type="submit"
            className="w-full bg-green-700 text-white p-3 rounded-lg
                       font-semibold hover:bg-green-800 transition"
          >
            Login
          </button>

        </form>

        {/* Signup */}

        <div className="text-center mt-6">

          <p className="text-gray-600 text-sm">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="inline-block mt-2 text-green-700 font-semibold
                       hover:underline"
          >
            Create an Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;