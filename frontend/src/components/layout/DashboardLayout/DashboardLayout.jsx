import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;