import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ArrowRight, ShieldCheck, Cpu, BarChart3, Globe } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation header */}
      <header className="bg-white border-b border-slate-200/80 px-6 lg:px-16 h-18 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="bg-forest-600 p-2 rounded-lg text-slate-100 shadow-md">
            <Recycle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-forest-950">TexWaste</h1>
            <span className="text-[10px] text-forest-600 font-bold block -mt-1 tracking-wider">INTELLIGENCE</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-slate-600 hover:text-forest-700 font-semibold text-sm transition-colors px-3 py-2 rounded-lg">
            Login
          </Link>
          <Link to="/register" className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl shadow-md transition-all">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 bg-forest-50 border border-forest-100 text-forest-800 px-3 py-1 rounded-full text-xs font-semibold">
            <Globe className="h-4 w-4 text-forest-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Empowering Circular Fashion Economy</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            AI-Driven Intelligence to <span className="text-forest-600">Eliminate Textile Waste</span>
          </h2>
          
          <p className="text-slate-600 text-lg leading-relaxed">
            The Textile Waste Intelligence Platform offers manufacturers, recycling facilities, and sustainability managers real-time material sorting workflows, recyclability scoring, and inventory tracking to close the fashion production loop.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/login" 
              className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-forest-600/10 flex items-center justify-center space-x-2 transition-all group"
            >
              <span>Access Portal</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/register" 
              className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-8 py-4 rounded-xl flex items-center justify-center transition-colors"
            >
              Request Admin Demo
            </Link>
          </div>
        </div>

        {/* Visual Graphic Mockup */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-forest-200/40 to-earth-200/40 rounded-3xl blur-3xl -z-10"></div>
          
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 w-full max-w-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-xs font-mono text-slate-400">classification_inference_v1.py</span>
            </div>

            {/* Simulated UI Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">AI Classification Target</span>
                  <h3 className="font-bold text-lg text-slate-800">Batch TXT-2026-042</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
                  94.2% Match
                </span>
              </div>

              {/* Composition breakdown bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Organic Cotton</span>
                    <span>72%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-forest-500 h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Recycled Polyester</span>
                    <span>28%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-earth-500 h-full rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-3 flex justify-between text-xs text-slate-500 font-medium">
                <span>Fiber length: Long Staple</span>
                <span>Recyclability: High (A)</span>
              </div>
            </div>

            {/* Impact numbers */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-forest-50/50 rounded-xl p-3 border border-forest-100">
                <span className="text-2xl font-extrabold text-forest-700">12.4t</span>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">CO2 Saved</p>
              </div>
              <div className="bg-earth-50/50 rounded-xl p-3 border border-earth-100">
                <span className="text-2xl font-extrabold text-earth-700">3.8M</span>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Liters Water</p>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                <span className="text-2xl font-extrabold text-emerald-700">98%</span>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Recycled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature block */}
      <section className="bg-slate-100 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">Platform Features</h3>
            <p className="text-slate-600">Designed from the ground up for modern supply chain transparency and carbon offset optimization.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="h-12 w-12 bg-forest-100 rounded-xl text-forest-700 flex items-center justify-center">
                <Cpu className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">Advanced Material Scanning</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Future image models ingest scans to predict fiber breakdowns, contaminants, and quality factors before inventory gets sorted.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="h-12 w-12 bg-earth-100 rounded-xl text-earth-700 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">Carbon & Water Analytics</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Instantly compute environmental impact offsets including landfill diversion, water preservation, and carbon reduction metrics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">Role-Based Integrity</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Audit logs are restricted to ensure Manufacturers write logs, Operators process batches, and Managers view analytical trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-center text-sm font-sans mt-auto">
        <p>© 2026 Textile Waste Intelligence Platform. All rights reserved. Milestone 1 Core Release.</p>
      </footer>
    </div>
  );
};

export default Landing;
