"use client";

import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const { clearSession } = useDashboardStore();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        clearSession();
        toast.success("Logged out");
        router.replace("/login");
      } else {
        toast.error("Logout failed");
      }
    } catch {
      toast.error("Network error during logout");
    }
  };

  return (
    <Button
      variant="outline"
      className={
        "text-zinc-950 bg-zinc-100 hover:text-amber-50 hover:bg-zinc-950"
      }
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
