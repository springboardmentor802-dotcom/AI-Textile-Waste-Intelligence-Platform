import { Clock } from "lucide-react";

function RecentActivity({ activities = [] }) {
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
        className="text-xl font-semibold mb-5"
        style={{
          color: "var(--text-primary)",
        }}
      >
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.length === 0 ? (
          <p
            style={{
              color: "var(--text-secondary)",
            }}
          >
            No recent activity available.
          </p>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4"
            >
              <div
                className="
                  p-2
                  rounded-full
                  bg-[var(--background)]
                "
              >
                <Clock
                  size={18}
                  style={{
                    color: "var(--primary)",
                  }}
                />
              </div>

              <div>

                <p
                  className="font-medium"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  {activity.title}
                </p>

                <p
                  className="text-sm mt-1"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {activity.time}
                </p>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default RecentActivity;