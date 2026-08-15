import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    company_name: "",
    role: "TEXTILE_MANUFACTURER",
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
      await registerUser(formData);

      alert("Registration Successful!");

      navigate("/login");

    } catch (err) {
      console.log(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration Failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}

        <div className="text-center mb-7">

          <div className="text-5xl mb-3">
            ♻️
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            Create Your Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join the Textile Intelligence Platform
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Full Name */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone_number"
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          {/* Company */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>

            <input
              type="text"
              name="company_name"
              placeholder="Enter company name"
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >

              <option value="TEXTILE_MANUFACTURER">
                Textile Manufacturer
              </option>

              <option value="RECYCLING_OPERATOR">
                Recycling Operator
              </option>

              <option value="SUSTAINABILITY_MANAGER">
                Sustainability Manager
              </option>

            </select>
          </div>

          {/* Password */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Error */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Register */}

          <button
            type="submit"
            className="w-full bg-green-700 text-white p-3 rounded-lg
                       font-semibold hover:bg-green-800 transition"
          >
            Create Account
          </button>

        </form>

        {/* Login Link */}

        <div className="text-center mt-6">

          <p className="text-gray-600 text-sm">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="inline-block mt-2 text-green-700 font-semibold
                       hover:underline"
          >
            Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;