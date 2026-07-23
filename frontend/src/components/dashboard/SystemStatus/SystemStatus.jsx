import {
  CheckCircle2,
} from "lucide-react";

function SystemStatus() {

  const status = [
    "MongoDB Connected",
    "Backend Running",
    "AI Service Ready",
    "Storage Healthy",
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
      <h2 className="text-xl font-semibold mb-5">
        System Status
      </h2>

      <div className="space-y-4">

        {status.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3"
          >
            <CheckCircle2
              color="#22c55e"
              size={20}
            />

            <span>{item}</span>
          </div>
        ))}

      </div>
    </div>
  );
}

export default SystemStatus;