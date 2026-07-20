import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Login.css';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await registerUser(fullName, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-tl" />
      <div className="auth-blob auth-blob-br" />

      <div className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">
            Textile Waste
            <span>Intelligence Platform</span>
          </h1>

          <p className="auth-subtitle">
            Create an account to start managing textile waste intelligently.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit">
              Create Account
            </button>
          </form>

          <div className="auth-switch-divider" />
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;