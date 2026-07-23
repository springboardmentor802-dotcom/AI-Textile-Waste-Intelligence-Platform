import {
  UserPlus,
  FileText,
  Brain,
  Package,
} from "lucide-react";

function QuickActions() {
  const actions = [
    {
      title: "Add User",
      icon: UserPlus,
    },
    {
      title: "Generate Report",
      icon: FileText,
    },
    {
      title: "AI Detection",
      icon: Brain,
    },
    {
      title: "Inventory",
      icon: Package,
    },
  ];

  return (
    <div
      className="
        mt-8
        bg-[var(--surface)]
        border
        rounded-2xl
        p-6
      "
      style={{
        borderColor: "var(--border)",
      }}
    >
      <h2
        className="text-xl font-semibold mb-6"
        style={{
          color: "var(--text-primary)",
        }}
      >
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {actions.map((action) => (
          <button
            key={action.title}
            className="
              border
              rounded-xl
              p-5
              hover:bg-[var(--background)]
              transition-all
              flex
              flex-col
              items-center
              gap-3
            "
            style={{
              borderColor: "var(--border)",
            }}
          >
            <action.icon
              size={28}
              style={{
                color: "var(--primary)",
              }}
            />

            <span>{action.title}</span>
          </button>
        ))}

      </div>
    </div>
  );
}

export default QuickActions;