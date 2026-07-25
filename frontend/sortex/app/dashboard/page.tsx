"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { routeForRole } from "@/lib/roleRoutes";

export default function DashboardIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.replace("/login");
      return;
    }

    router.replace(routeForRole(role));
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-stone-100 font-sans">
      <div className="flex items-center gap-3 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Redirecting to your dashboard...
      </div>
    </div>
  );
}