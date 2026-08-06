import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught An Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md text-center max-w-md w-full space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Dashboard Rendering Exception
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected rendering state occurred. The system safely intercepted the error to prevent application downtime.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left font-mono text-[11px] text-red-600 truncate">
                {this.state.error?.toString() || "Unknown error"}
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={this.handleReset}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
                >
                  Reload Page
                </button>
                <a
                  href="/dashboard"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition border border-slate-300"
                >
                  Dashboard Home
                </a>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
