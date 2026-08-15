import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Check password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Same minimum length as registration
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email: formData.email,
        new_password: formData.newPassword,
      });

      alert("Password Reset Successful!");

      navigate("/login");

    } catch (err) {
      console.log(err);
      console.log(err.response);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Password reset failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            🔐
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            Reset Password
          </h1>

          <p className="text-gray-500 mt-2">
            Create a new password for your account
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

          </div>

          {/* New Password */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

          </div>

          {/* Confirm Password */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

          </div>

          {/* Error */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Reset Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white p-3 rounded-lg
                       font-semibold hover:bg-green-800 transition
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

        </form>

        {/* Back to Login */}

        <div className="text-center mt-6">

          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;