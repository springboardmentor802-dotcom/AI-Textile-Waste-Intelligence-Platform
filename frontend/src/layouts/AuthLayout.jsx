function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "var(--background)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}

        <div className="text-center mb-8">

          <h1
            className="text-3xl font-bold"
            style={{
              color: "var(--primary)",
            }}
          >
            AI Textile
          </h1>

          <p
            className="mt-2"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Waste Management Platform
          </p>

        </div>

        {/* Card */}

        <div
          className="p-8"
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;