import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await loginUser(email, password);
      navigate('/dashboard');
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
            AI-powered platform for smarter textile waste management and sustainability.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit">
              Sign In
            </button>
          </form>

          <div className="auth-switch-divider" />
          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;