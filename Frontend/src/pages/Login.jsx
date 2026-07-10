import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  return (
    <div className="auth-container">
      <h1 className="auth-brand">♻ Textile Waste Intelligence Platform</h1>
      <h2>Login</h2>
      <form className="auth-form">
        <label>Email</label>
        <input type="email" placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" placeholder="••••••••" />

        <button type="submit">Login</button>
      </form>
      <p className="auth-switch">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;