"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  variant?: "sidebar" | "floating";
  className?: string;
}

export function ThemeToggle({ variant = "floating", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === "sidebar") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
          theme === "light"
            ? "bg-amber-100/80 text-amber-950 border-amber-300/80 hover:bg-amber-200/80"
            : "bg-neutral-900 text-neutral-300 border-white/10 hover:bg-neutral-800 hover:text-white"
        } ${className}`}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Cream Mode"}
      >
        <div className="flex items-center gap-2.5">
          {theme === "light" ? (
            <Sun className="w-4 h-4 text-amber-600 animate-pulse" />
          ) : (
            <Moon className="w-4 h-4 text-orange-400" />
          )}
          <span className="font-medium text-xs sm:text-sm">
            {theme === "light" ? "Light Cream" : "Dark Mode"}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20">
          {theme === "light" ? "Light" : "Dark"}
        </span>
      </button>
    );
  }

  // Floating variant for pages like Landing Page, Login Page, etc.
  return (
    <div className={`fixed bottom-6 left-6 z-50 ${className}`}>
      <button
        onClick={toggleTheme}
        type="button"
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
          theme === "light"
            ? "bg-amber-50/90 text-stone-900 border-amber-300/80 shadow-amber-900/10"
            : "bg-neutral-900/90 text-white border-white/15 shadow-black/50"
        }`}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Cream Mode"}
      >
        {theme === "light" ? (
          <Sun className="w-4 h-4 text-amber-600 animate-pulse" />
        ) : (
          <Moon className="w-4 h-4 text-orange-400" />
        )}
        <span className="text-xs font-bold tracking-wide">
          {theme === "light" ? "Light Cream Mode" : "Dark Mode"}
        </span>
      </button>
    </div>
  );
}
