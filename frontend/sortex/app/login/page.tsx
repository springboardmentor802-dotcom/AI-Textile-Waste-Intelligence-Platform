"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Recycle, Briefcase } from "lucide-react";

type PlatformRole = "Admin" | "Recycling Facilitator" | "Sustainability Manager" | "Manufacturer";
type RegistrableRole = Exclude<PlatformRole, "Admin">;

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

  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<RegistrableRole>("Recycling Facilitator");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!isLoginMode) {
        const regResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
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

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex lg:w-3/5 relative bg-slate-900 overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1605280263929-1c429624440f?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />

        <div className="relative z-20 p-12 max-w-2xl text-left">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Sortex<span className="text-emerald-400">AI</span>
            </h1>
          </div>

          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Intelligence for
            <br />
            <span className="text-emerald-400">Sustainable</span> Textiles.
          </h2>

          <p className="text-lg text-slate-300 leading-relaxed mb-12">
            The industry&apos;s leading computer vision platform for automated textile sorting, waste
            diversion analytics, and circular economy tracking.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white z-20 shadow-[0_0_40px_rgba(0,0,0,0.05)] overflow-y-auto py-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Sortex<span className="text-emerald-600">AI</span>
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {isLoginMode ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLoginMode ? "Please enter your details to sign in." : "Join the circular textile revolution."}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                {isLoginMode && (
                  <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="role">
                  Platform Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as RegistrableRole)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none bg-white"
                  >
                    <option value="Recycling Facilitator">Recycling Facilitator</option>
                    <option value="Sustainability Manager">Sustainability Manager</option>
                    <option value="Manufacturer">Manufacturer</option>
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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

          <p className="mt-8 text-center text-sm text-slate-500">
            {isLoginMode ? "New user? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError("");
              }}
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors bg-transparent border-none cursor-pointer"
            >
              {isLoginMode ? "Register here" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}