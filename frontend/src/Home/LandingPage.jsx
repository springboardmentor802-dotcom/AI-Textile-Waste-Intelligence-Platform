import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-20 pb-28">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">


              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Transform Textile Waste Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                  Actionable Intelligence
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
                Precision inventory management, batch traceability, and material categorization built for sustainable textile manufacturing and recycling ecosystems.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/analysis"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition text-sm"
                >
                  Launch AI Analysis Engine
                </Link>
                <Link
                  to="/inventory"
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl transition text-sm"
                >
                  Launch Inventory Portal
                </Link>
              </div>
            </div>

            {/* Quick Metrics Banner */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-blue-400">100%</p>
                <p className="text-xs font-medium text-slate-300 mt-1 uppercase tracking-wide">
                  Traceable Waste Batches
                </p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-green-400">10+ Fabrics</p>
                <p className="text-xs font-medium text-slate-300 mt-1 uppercase tracking-wide">
                  AI Material Categories
                </p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-blue-400">CNN</p>
                <p className="text-xs font-medium text-slate-300 mt-1 uppercase tracking-wide">
                  Deep Feature Extraction
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Platform Section */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  About Platform
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-6">
                  Intelligent Infrastructure for Circular Textile Management
                </h2>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  The AI Textile Waste Intelligence Platform addresses one of the global fashion industry’s most critical operational bottlenecks: fragmented and untraceable post-industrial and post-consumer textile waste.
                </p>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  By combining deep convolutional neural network image analysis with a digitized batch ledger, our platform enables mills, recyclers, and brand auditors to automatically identify fabric compositions and track circular flows.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      AI Vision Engine
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Automated classification of 10 textile categories in milliseconds
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Full Traceability
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Batch ID linkage from factory floor to recycling depot
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl"></div>
                <h3 className="text-lg font-bold mb-4">Core System Specification</h3>
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">Architecture</span>
                    <span className="font-semibold text-white">Full Stack Node/React/Mongo</span>
                  </div>
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">AI Engine</span>
                    <span className="font-semibold text-white">Decoupled Inference Architecture</span>
                  </div>
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">Security</span>
                    <span className="font-semibold text-white">JWT + Bcrypt Hash + RBAC</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400">Classification</span>
                    <span className="font-semibold text-green-400">10 Primary Textile Profiles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Core Capabilities
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                Enterprise Textile Management Features
              </h2>
              <p className="text-slate-600 mt-3 text-sm">
                Built strictly to production standards with comprehensive authentication, audit-ready data models, and enterprise UI aesthetics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xl mb-6">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Batch Inventory Control
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Log, update, filter, and audit textile waste batches with structured attributes including Waste Batch ID, Fabric Type, Source, Quantity, Color, Condition, and Collection Date.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-green-600/10 text-green-600 flex items-center justify-center font-bold text-xl mb-6">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Role-Based Security
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Protected enterprise access powered by JSON Web Tokens and Bcrypt password hashing. Granular Admin and Specialist role separation ensures data integrity.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-slate-900/10 text-slate-900 flex items-center justify-center font-bold text-xl mb-6">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  AI Image Analysis Engine
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Automated visual material grading using deep feature extraction. Analyzes uploaded textile samples instantly and registers findings directly into the inventory ledger.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
