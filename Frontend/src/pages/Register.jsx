import { Link } from 'react-router-dom';
import './Login.css';

function Register() {
  return (
    <div className="auth-container">
      <h1 className="auth-brand">♻ Textile Waste Intelligence Platform</h1>
      <h2>Register</h2>
      <form className="auth-form">
        <label>Full Name</label>
        <input type="text" placeholder="Your full name" />

        <label>Email</label>
        <input type="email" placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" placeholder="••••••••" />

        <button type="submit">Register</button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;