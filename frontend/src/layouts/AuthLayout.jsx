function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Section */}
      <div className="hidden lg:flex bg-green-700 text-white items-center justify-center p-12">

        <div>

          <h1 className="text-5xl font-bold mb-6">
            Textile Waste Intelligence Platform
          </h1>

          <p className="text-xl leading-9">
            AI Powered Textile Waste Classification,
            Sustainability Analytics,
            Recycling Intelligence
            and Circular Economy Platform.
          </p>

        </div>

      </div>

      {/* Right Section */}

      <div className="flex items-center justify-center bg-gray-100">

        {children}

      </div>

    </div>
  );
}

export default AuthLayout;
