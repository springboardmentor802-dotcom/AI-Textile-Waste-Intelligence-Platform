import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
  getMyProfile,
  updateProfile,
} from "../../api/userApi";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();

      setFormData({
        name: data.name,
        email: data.email,
      });
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(formData);

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Something went wrong."
      );
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
        }}
      >
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: "30px",
          }}
        >
          <h2>Edit Profile</h2>

          <hr />

          <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label>Name</label>

              <br />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label>Email</label>

              <br />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Update Profile
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              style={{
                padding: "10px 20px",
                marginLeft: "15px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: "20px",
                color: "green",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default EditProfile;