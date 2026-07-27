import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    setLoading(true);
    setError("");

    const result = await login(formData);

    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div
        style={{
            minHeight: "100vh",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
        }}
    >

        <div
            style={{
                width: "400px",
                background: "#ffffff",
                padding: "40px",
                borderRadius: "18px",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                border: "1px solid #e5e7eb",
            }}
        >

            <h1
                style={{
                    textAlign: "center",
                    fontSize: "30px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "8px",
                }}
            >
                Welcome Back
            </h1>


            <p
                style={{
                    textAlign: "center",
                    color:"#64748b",
                    fontSize:"14px",
                    marginBottom:"30px"
                }}
            >
                Login to access Textile Waste Intelligence Platform
            </p>



            <form onSubmit={handleSubmit}>


                <div
                    style={{
                        marginBottom:"22px"
                    }}
                >

                    <label
                        style={{
                            display:"block",
                            marginBottom:"8px",
                            fontSize:"14px",
                            fontWeight:"600",
                            color:"#334155"
                        }}
                    >
                        Email Address
                    </label>


                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        style={{
                            width:"100%",
                            padding:"13px 14px",
                            border:"1px solid #cbd5e1",
                            borderRadius:"10px",
                            fontSize:"15px",
                            outline:"none",
                            boxSizing:"border-box",
                            background:"#f8fafc",
                            color:"#111827"
                        }}
                    />

                </div>




                <div
                    style={{
                        marginBottom:"22px"
                    }}
                >

                    <label
                        style={{
                            display:"block",
                            marginBottom:"8px",
                            fontSize:"14px",
                            fontWeight:"600",
                            color:"#334155"
                        }}
                    >
                        Password
                    </label>


                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                        style={{
                            width:"100%",
                            padding:"13px 14px",
                            border:"1px solid #cbd5e1",
                            borderRadius:"10px",
                            fontSize:"15px",
                            outline:"none",
                            boxSizing:"border-box",
                            background:"#f8fafc",
                            color:"#111827"
                        }}
                    />

                </div>



                {
                    error &&

                    <div
                        style={{
                            background:"#fee2e2",
                            color:"#991b1b",
                            padding:"12px",
                            borderRadius:"8px",
                            marginBottom:"20px",
                            fontSize:"14px"
                        }}
                    >
                        {error}
                    </div>

                }




                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width:"100%",
                        padding:"13px",
                        background:
                            "linear-gradient(135deg,#2563eb,#1d4ed8)",
                        color:"#ffffff",
                        border:"none",
                        borderRadius:"10px",
                        fontSize:"15px",
                        fontWeight:"600",
                        cursor:"pointer",
                        boxShadow:
                            "0 5px 15px rgba(37,99,235,0.25)"
                    }}
                >
                    {
                        loading
                        ? "Logging in..."
                        : "Login"
                    }
                </button>


            </form>



            <p
                style={{
                    textAlign:"center",
                    marginTop:"25px",
                    fontSize:"14px",
                    color:"#64748b"
                }}
            >
                Don't have an account?{" "}

                <Link
                    to="/register"
                    style={{
                        color:"#2563eb",
                        fontWeight:"600",
                        textDecoration:"none"
                    }}
                >
                    Register
                </Link>

            </p>


        </div>

    </div>
);
};

export default Login;