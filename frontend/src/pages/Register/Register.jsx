import { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import API from "../../api/axios";
import "../Login/Login.css";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await API.post("/auth/register", form);
      navigate("/", {
        replace: true,
        state: {
          message: "Account created successfully. Please log in.",
          username: form.name.trim(),
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <h1>AI Textile Waste Intelligence Platform</h1>
          <p>
            Join the platform and turn textile waste data into sustainable
            action.
          </p>
          <ul className="features">
            <li>✔ AI Waste Classification</li>
            <li>✔ Textile Inventory Management</li>
            <li>✔ Smart Analytics Dashboard</li>
            <li>✔ Sustainability Recommendations</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card register-card">
          <h2>Create Account</h2>
          <p>Register to access the intelligence platform</p>

          {error && (
            <div className="form-message error-message" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="register-name">Name</label>
              <div className="input-box">
                <FaUser className="input-icon" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={updateField}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <div className="input-box">
                <FaEnvelope className="input-icon" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={updateField}
                  maxLength={150}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <div className="input-box">
                <FaLock className="input-icon" />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={updateField}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
