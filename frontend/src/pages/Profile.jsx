function Profile() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      {/* Page Heading */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your account information and monitor your AI Textile Intelligence activity.
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

            <h2 className="text-3xl font-bold">

              {user?.name || "User"}

            </h2>

            <p className="text-green-600 text-lg mt-2">

              {user?.role || "Administrator"}

            </p>

            <p className="text-gray-500 mt-2">

              {user?.email || "user@example.com"}

            </p>

            <div className="mt-6">

              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl">

                Edit Profile

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

        <StatCard
          title="Images Analysed"
          value="156"
          icon="🖼️"
          color="border-blue-500"
        />

        <StatCard
          title="Materials Identified"
          value="10"
          icon="🧵"
          color="border-green-500"
        />

        <StatCard
          title="Reports Generated"
          value="64"
          icon="📄"
          color="border-purple-500"
        />

        <StatCard
          title="Average Sustainability"
          value="88%"
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
            value={user?.role || "Administrator"}
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

function StatCard({ title, value, icon, color }) {

  return (

    <div className={`bg-white border-l-4 ${color} rounded-2xl shadow-lg p-6`}>

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

function Info({ label, value }) {

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