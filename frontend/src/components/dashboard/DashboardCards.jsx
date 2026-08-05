import { Link } from "react-router-dom";

function DashboardCards() {

  const actions = [

    {
      title: "AI Textile Intelligence",
      icon: "🤖",
      description:
        "Upload a textile image and receive complete AI-powered material recognition, defect detection, waste classification and sustainability analysis.",
      button: "Start Analysis",
      path: "/textile-intelligence",
      color: "from-green-500 to-emerald-600",
    },

    {
      title: "Inventory Management",
      icon: "📦",
      description:
        "Manage textile inventory, monitor recyclable materials and organize collected waste efficiently.",
      button: "Open Inventory",
      path: "/inventory",
      color: "from-blue-500 to-cyan-600",
    },

    {
      title: "Analytics Dashboard",
      icon: "📊",
      description:
        "Visualize AI predictions, sustainability trends and textile waste statistics through interactive dashboards.",
      button: "View Analytics",
      path: "/analytics",
      color: "from-orange-500 to-red-500",
    },

    {
      title: "Reports",
      icon: "📄",
      description:
        "Generate AI reports, export analysis results and download sustainability summaries.",
      button: "Open Reports",
      path: "/reports",
      color: "from-purple-500 to-pink-600",
    },

  ];

  return (

    <div>

      <h2 className="text-3xl font-bold mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {actions.map((item, index) => (

          <div
            key={index}
            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300"
          >

            <div
              className={`bg-gradient-to-r ${item.color} p-6 text-white`}
            >

              <div className="text-6xl mb-4">

                {item.icon}

              </div>

              <h2 className="text-3xl font-bold">

                {item.title}

              </h2>

            </div>

            <div className="p-6">

              <p className="text-gray-600 leading-7">

                {item.description}

              </p>

              <Link
                to={item.path}
              >

                <button
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                >

                  {item.button}

                </button>

              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default DashboardCards;