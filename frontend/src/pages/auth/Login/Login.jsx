import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

import { loginUser } from "@/services/authService";

function Login() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {

    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    try {

      setLoading(true);

      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem(
        "access_token",
        response.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      switch (response.user.role) {

        case "administrator":
          navigate("/admin");
          break;

        case "manufacturer":
          navigate("/manufacturer");
          break;

        case "recycler":
          navigate("/recycler");
          break;

        case "manager":
          navigate("/manager");
          break;

        default:
          navigate("/");
      }

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Login failed."
      );

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
            Welcome Back
          </h2>

          <p
            className="mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to your account
          </p>
        </div>

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

        {/* Password */}
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">

          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />

            Remember Me
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            Forgot Password?
          </Link>

        </div>

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

        {/* Login Button */}
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Login"}
        </Button>

        {/* Register Link */}
        <div className="text-center text-sm">
          <span
            style={{ color: "var(--text-secondary)" }}
          >
            Don't have an account?
          </span>

          <Link
            to="/register"
            className="ml-2 font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Register
          </Link>
        </div>

      </form>

    </AuthLayout>
  );
}

export default Login;