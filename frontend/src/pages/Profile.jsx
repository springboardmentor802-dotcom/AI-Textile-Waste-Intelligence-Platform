import { useEffect, useState } from "react";
import { getReports } from "../utils/reportStorage";

function Profile() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

  const [reports, setReports] = useState([]);

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
  });

  // --------------------------------------------------
  // LOAD REPORTS
  // --------------------------------------------------

  useEffect(() => {
    loadReports();

    const handleReportsUpdate = () => {
      loadReports();
    };

    window.addEventListener(
      "reportsUpdated",
      handleReportsUpdate
    );

    return () => {
      window.removeEventListener(
        "reportsUpdated",
        handleReportsUpdate
      );
    };
  }, []);

  const loadReports = () => {
    setReports(getReports());
  };

  // --------------------------------------------------
  // EDIT PROFILE
  // --------------------------------------------------

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: formData.name,
      role: formData.role,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    setEditing(false);

    alert("Profile Updated Successfully!");
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      role: user?.role || "",
    });

    setEditing(false);
  };

  // --------------------------------------------------
  // REAL STATISTICS
  // --------------------------------------------------

  const imagesAnalysed = reports.length;

  const uniqueMaterials = [
    ...new Set(
      reports
        .map((report) => report.material)
        .filter(Boolean)
    ),
  ];

  const materialsIdentified =
    uniqueMaterials.length;

  const reportsGenerated = reports.length;

  const sustainabilityValues = reports
    .map((report) => {
      const value =
        report.sustainability ??
        report.data?.sustainability_score;

      return Number(value);
    })
    .filter(
      (value) =>
        !Number.isNaN(value)
    );

  const averageSustainability =
    sustainabilityValues.length > 0
      ? Math.round(
          sustainabilityValues.reduce(
            (sum, value) => sum + value,
            0
          ) / sustainabilityValues.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Page Heading */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your account information and monitor
          your AI Textile Intelligence activity.
        </p>

      </div>


      {/* Profile Card */}

      <div className="bg-white rounded-3xl shadow-lg p-8">

        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Avatar */}

          <div className="w-36 h-36 rounded-full bg-green-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">

            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}

          </div>


          {/* Details */}

          <div className="flex-1">

            {!editing ? (

              <>
                <h2 className="text-3xl font-bold">

                  {user?.name || "User"}

                </h2>

                <p className="text-green-600 text-lg mt-2">

                  {user?.role || "User"}

                </p>

                <p className="text-gray-500 mt-2">

                  {user?.email || "user@example.com"}

                </p>

                <div className="mt-6">

                  <button
                    onClick={() => setEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                  >
                    Edit Profile
                  </button>

                </div>
              </>

            ) : (

              <div className="max-w-md">

                <h2 className="text-2xl font-bold mb-5">
                  Edit Profile
                </h2>

                {/* Name */}

                <div className="mb-4">

                  <label className="block text-gray-600 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>


                {/* Role */}

                <div className="mb-5">

                  <label className="block text-gray-600 mb-2">
                    Role
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >

                    <option value="Administrator">
                      Administrator
                    </option>

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

                </div>


                {/* Buttons */}

                <div className="flex gap-3">

                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

        <StatCard
          title="Images Analysed"
          value={imagesAnalysed}
          icon="🖼️"
          color="border-blue-500"
        />

        <StatCard
          title="Materials Identified"
          value={materialsIdentified}
          icon="🧵"
          color="border-green-500"
        />

        <StatCard
          title="Reports Generated"
          value={reportsGenerated}
          icon="📄"
          color="border-purple-500"
        />

        <StatCard
          title="Average Sustainability"
          value={`${averageSustainability}%`}
          icon="🌱"
          color="border-yellow-500"
        />

      </div>


      {/* Account Information */}

      <div className="bg-white rounded-3xl shadow-lg mt-8 p-8">

        <h2 className="text-2xl font-bold mb-6">
          Account Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <Info
            label="Full Name"
            value={user?.name || "User"}
          />

          <Info
            label="Role"
            value={user?.role || "User"}
          />

          <Info
            label="Email"
            value={user?.email || "Not Available"}
          />

          <Info
            label="Platform"
            value="AI Textile Intelligence"
          />

          <Info
            label="Version"
            value="1.0"
          />

          <Info
            label="Status"
            value="Active"
          />

        </div>

      </div>

    </div>
  );
}


// ==================================================
// STAT CARD
// ==================================================

function StatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div
      className={`bg-white border-l-4 ${color} rounded-2xl shadow-lg p-6`}
    >

      <div className="text-4xl">
        {icon}
      </div>

      <h3 className="text-gray-500 mt-4">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}


// ==================================================
// INFO
// ==================================================

function Info({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-gray-500">
        {label}
      </p>

      <p className="font-semibold text-lg mt-1">
        {value}
      </p>

    </div>
  );
}


export default Profile;