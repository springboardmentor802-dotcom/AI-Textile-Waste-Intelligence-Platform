import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    company_name: "",
    role: "TEXTILE_MANUFACTURER",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await registerUser(formData);

      alert("Registration Successful!");

      navigate("/login");

    } catch (err) {
      console.log(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration Failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[450px]">

        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="company_name"
            placeholder="Company Name"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            className="w-full border p-3 rounded"
            onChange={handleChange}
          >
            <option value="TEXTILE_MANUFACTURER">
              Textile Manufacturer
            </option>

            <option value="RECYCLING_OPERATOR">
              Recycling Operator
            </option>

            <option value="SUSTAINABILITY_MANAGER">
              Sustainability Manager
            </option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          {error && (
            <p className="text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-700 text-white p-3 rounded hover:bg-green-800"
          >
            Register
          </button>

        </form>

      </div>
    </div>
  );
}

export default Register;