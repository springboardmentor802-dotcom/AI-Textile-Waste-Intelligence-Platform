import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await axios.post("http://127.0.0.1:8000/api/register/", {
                username,
                email,
                password,
                role,
            });

            navigate("/login");

        } catch (err) {
            setError(
                JSON.stringify(err.response?.data) || "Registration failed."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Create your account</h2>
                <p className="auth-subtitle">Join the circular textile network</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="auth-field">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select role</option>
                            <option value="Recycling Facility Operator">
                                Recycling Facility Operator
                            </option>
                            <option value="Sustainability Manager">
                                Sustainability Manager
                            </option>
                            <option value="Textile Manufacturer Administrator">
                                Textile Manufacturer Administrator
                            </option>
                        </select>
                    </div>

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <div className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;