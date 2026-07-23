import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

import { registerUser } from "@/services/authService";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      formData.full_name.trim() === "" ||
      formData.email.trim() === "" ||
      formData.role.trim() === "" ||
      formData.password.trim() === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      alert("Registration Successful!");

      navigate("/login");

    } catch (err) {

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      <form
        className="space-y-6"
        onSubmit={handleSubmit}
      >
              {/* Header */}
        <div className="text-center">
          <h2
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Create Account
          </h2>

          <p
            className="mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Join the AI Textile Waste Intelligence Platform
          </p>
        </div>

        {/* Full Name */}
        <Input
          id="full_name"
          name="full_name"
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />

        {/* Email */}
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Role */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="role"
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Role
            <span
              className="ml-1"
              style={{ color: "var(--danger)" }}
            >
              *
            </span>
          </label>

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full rounded-xl px-4 py-3 outline-none"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select your role</option>
            <option value="administrator">Administrator</option>
            <option value="manufacturer">Textile Manufacturer</option>
            <option value="recycler">Recycler</option>
            <option value="manager">Sustainability Manager</option>
          </select>
        </div>

        {/* Password */}
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* Error Message */}
        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm font-medium"
            style={{
              background: "#FEE2E2",
              color: "#B91C1C",
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {/* Login Link */}
        <div className="text-center text-sm">
          <span style={{ color: "var(--text-secondary)" }}>
            Already have an account?
          </span>

          <Link
            to="/login"
            className="ml-2 font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Login
          </Link>
        </div>

      </form>

    </AuthLayout>
  );
}

export default Register;