function SectionHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="flex items-center justify-between mb-8">

      <div>

        <h1
          className="text-3xl font-bold"
          style={{
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-2"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {subtitle}
          </p>
        )}

      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
}

export default SectionHeader;