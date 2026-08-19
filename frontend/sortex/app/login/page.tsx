"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Recycle, Briefcase, Cpu, Layers, LineChart } from "lucide-react";
import { routeForRole } from "@/lib/roleRoutes";
import { ThemeToggle } from "../components/ThemeToggle";

type PlatformRole = "Admin" | "Recycling Facilitator" | "Sustainability Manager" | "Manufacturer";

interface RegisterResponse {
  detail?: string;
}

interface LoginResponse {
  access_token: string;
  role: PlatformRole;
  detail?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Recycling Facilitator");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!isLoginMode) {
        const regResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        if (!regResponse.ok) {
          const errorData: RegisterResponse = await regResponse.json();
          throw new Error(errorData.detail || "Registration failed. Email might already exist.");
        }
      }

      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_role", data.role);

      router.push(routeForRole(data.role));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-black font-sans relative overflow-hidden">

      {/* Scattered soft orange glowing blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-[36rem] h-[36rem] bg-orange-600/20 rounded-full blur-[140px] z-0" />
      <div className="pointer-events-none absolute top-[20%] right-[15%] w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-[130px] z-0" />
      <div className="pointer-events-none absolute bottom-[25%] left-[25%] w-[32rem] h-[32rem] bg-orange-500/15 rounded-full blur-[150px] z-0" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-[34rem] h-[34rem] bg-orange-600/15 rounded-full blur-[160px] z-0" />
      
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col p-12 lg:p-16 z-10">

        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
        >
          <div className="p-2.5 bg-orange-500 rounded-xl shadow-lg shadow-orange-900/40">
            <Recycle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sortex<span className="text-orange-400">AI</span>
          </h1>
        </button>

        {/* Hero & Features */}
        <div className="mt-12 lg:mt-16 ml-12 lg:ml-24 max-w-xl">
          <h2 className="text-5xl lg:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
            Sort smarter.<br />
            Recycle <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-200">better.</span>
          </h2>

          <div className="space-y-7">
            <div className="flex items-start gap-5 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300">
                <Cpu className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold tracking-wide">AI Material Analysis</h3>
                <p className="text-neutral-500 mt-0.5 text-sm leading-relaxed">Instant fabric composition detection via computer vision.</p>
              </div>
            </div>

            <div className="flex items-start gap-5 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300">
                <Layers className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold tracking-wide">Automated Workflows</h3>
                <p className="text-neutral-500 mt-0.5 text-sm leading-relaxed">Streamlined inventory for modern recycling facilitators.</p>
              </div>
            </div>

            <div className="flex items-start gap-5 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300">
                <LineChart className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold tracking-wide">ESG Reporting</h3>
                <p className="text-neutral-500 mt-0.5 text-sm leading-relaxed">Real-time diversion rates and sustainability metrics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Auth form panel */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-16 z-10 overflow-y-auto py-12 pb-24 lg:pb-12 lg:border-l lg:border-white/5">
        
        <div className="w-full max-w-sm mx-auto lg:ml-12 lg:mr-auto">

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex lg:hidden items-center gap-2 mb-8 w-fit hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-orange-500 rounded-lg">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Sortex<span className="text-orange-400">AI</span>
            </h1>
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLoginMode ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-neutral-500 mb-8 text-sm">
            {isLoginMode ? "Sign in to continue." : "Join the circular textile revolution."}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
	    <div className="space-y-2">
    	      <label className="text-sm font-medium text-neutral-300" htmlFor="name">
      	        Full name
              </label>
              <div className="relative">
                <input
        	  id="name"
        	  type="text"
        	  required
        	  value={name}
        	  onChange={(e) => setName(e.target.value)}
        	  className="block w-full pl-3 pr-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
        	  placeholder="Jane Doe"
      		/>
    	      </div>
  	    </div>	
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-300" htmlFor="password">
                  Password
                </label>
                {isLoginMode && (
                  <a href="#" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300" htmlFor="role">
                  Platform Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-neutral-500" />
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as PlatformRole)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all appearance-none [&>option]:bg-neutral-900"
                  >
                    <option value="Recycling Facilitator">Recycling Facilitator</option>
                    <option value="Sustainability Manager">Sustainability Manager</option>
                    <option value="Manufacturer">Manufacturer</option>
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-2.5 px-4 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-orange-900/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLoginMode ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLoginMode ? "Sign in to dashboard" : "Register & Continue"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            {isLoginMode ? "New user? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError("");
              }}
              className="font-medium text-orange-400 hover:text-orange-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              {isLoginMode ? "Register here" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-neutral-600 whitespace-nowrap z-20">
        <span>Made with</span>
        <span className="text-red-500">❤️</span>
        <span>by</span>
        <span className="font-semibold text-orange-400/80">JanKas</span>
      </div>

      {/* FLOATING THEME TOGGLE — BOTTOM LEFT CORNER */}
      <ThemeToggle variant="floating" />
    </div>
  );
}
