import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">♻ Textile Waste Intelligence Platform</span>
      <div className="navbar-links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/inventory">Inventory</Link>
      </div>
    </nav>
  );
}

export default Navbar;