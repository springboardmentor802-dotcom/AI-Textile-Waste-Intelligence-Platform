import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/userApi";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    try {
      await registerUser(formData);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed."
      );
    }

    setLoading(false);
  };

  return (
    <div
        style={{
            minHeight:"100vh",
            background:"#f8fafc",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            padding:"20px"
        }}
    >

        <div
            style={{
                width:"420px",
                background:"#ffffff",
                padding:"40px",
                borderRadius:"18px",
                border:"1px solid #e5e7eb",
                boxShadow:"0 10px 30px rgba(15,23,42,0.08)"
            }}
        >

            <h1
                style={{
                    textAlign:"center",
                    fontSize:"30px",
                    fontWeight:"700",
                    color:"#0f172a",
                    marginBottom:"8px"
                }}
            >
                Create Account
            </h1>


            <p
                style={{
                    textAlign:"center",
                    color:"#64748b",
                    fontSize:"14px",
                    marginBottom:"30px"
                }}
            >
                Join Textile Waste Intelligence Platform
            </p>



            <form onSubmit={handleSubmit}>


                <div style={{marginBottom:"20px"}}>

                    <label
                        style={{
                            display:"block",
                            marginBottom:"8px",
                            fontSize:"14px",
                            fontWeight:"600",
                            color:"#334155"
                        }}
                    >
                        Full Name
                    </label>


                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
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




                <div style={{marginBottom:"20px"}}>

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




                <div style={{marginBottom:"20px"}}>

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
                        placeholder="Create password"
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





                <div style={{marginBottom:"25px"}}>

                    <label
                        style={{
                            display:"block",
                            marginBottom:"8px",
                            fontSize:"14px",
                            fontWeight:"600",
                            color:"#334155"
                        }}
                    >
                        Register As
                    </label>


                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        style={{
                            width:"100%",
                            padding:"13px 14px",
                            border:"1px solid #cbd5e1",
                            borderRadius:"10px",
                            fontSize:"15px",
                            outline:"none",
                            background:"#ffffff",
                            color:"#111827"
                        }}
                    >

                        <option value="">
                            Select Role
                        </option>

                        <option value="Manufacturer">
                            Manufacturer
                        </option>

                        <option value="Recycler">
                            Recycler
                        </option>

                    </select>


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




                {
                    success &&

                    <div
                        style={{
                            background:"#ecfdf5",
                            color:"#065f46",
                            padding:"12px",
                            borderRadius:"8px",
                            marginBottom:"20px",
                            fontSize:"14px"
                        }}
                    >
                        {success}
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
                        ? "Registering..."
                        : "Create Account"
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

                Already have an account?{" "}

                <Link
                    to="/login"
                    style={{
                        color:"#2563eb",
                        fontWeight:"600",
                        textDecoration:"none"
                    }}
                >
                    Login
                </Link>

            </p>


        </div>


    </div>
);
};

export default Register;