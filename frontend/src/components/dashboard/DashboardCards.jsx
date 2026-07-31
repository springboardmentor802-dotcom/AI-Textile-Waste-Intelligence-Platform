
function DashboardCards() {
  const actions = [
    {
      title: "Material Analysis",
      icon: "🧵",
      desc: "Identify the fabric material using AI.",
      color: "border-blue-500",
      button: "Open Material Analysis",
    },
    {
      title: "Defect Detection",
      icon: "🔍",
      desc: "Detect defects in fabric images.",
      color: "border-red-500",
      button: "Open Defect Analysis",
    },
    {
      title: "Inventory",
      icon: "📦",
      desc: "Manage textile waste inventory.",
      color: "border-green-500",
      button: "Open Inventory",
    },
    {
      title: "Reports",
      icon: "📄",
      desc: "View and print AI analysis reports.",
      color: "border-purple-500",
      button: "Open Reports",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {actions.map((item, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl shadow-lg border-l-4 ${item.color}
          hover:shadow-xl transition-all duration-300 p-6`}
        >
          <div className="text-5xl mb-4">{item.icon}</div>

          <h2 className="text-xl font-bold mb-2">
            {item.title}
          </h2>

          <p className="text-gray-600 mb-6">
            {item.desc}
          </p>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
          >
            {item.button}
          </button>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
