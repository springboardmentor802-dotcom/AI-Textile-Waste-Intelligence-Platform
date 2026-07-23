function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div
      className="
    bg-[var(--surface)]
    border
    rounded-2xl
    p-6
    shadow-sm
    hover:shadow-lg
    hover:-translate-y-1
    transition-all
    duration-300
"
      style={{
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start justify-between">

        <div>

          <p
            className="text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {title}
          </p>

          <h2
            className="text-3xl font-bold mt-2"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {value}
          </h2>

          {subtitle && (
            <p
              className="text-sm mt-2"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {subtitle}
            </p>
          )}

        </div>

        {Icon && (
          <div
            className="
              w-14
              h-14
              rounded-xl
              flex
              items-center
              justify-center
              bg-[var(--background)]
            "
          >
            <Icon
              size={28}
              style={{
                color: "var(--primary)",
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardCard;