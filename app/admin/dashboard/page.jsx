"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";
import { LogoutButton } from "@/components/Logout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function Page() {
  const { user, isAuthenticated, loading, clearSession, setSession } =
    useDashboardStore();
  const router = useRouter();

  //hydration of session on page load
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (data.dashboard === "studentStyle") {
          setSession({
            user: data.user,
            dashboard: "studentStyle",
          });
          router.push("/student/dashboard");
        }

        if (!data.success) {
          clearSession();
          router.push("/login");
        }

        if (data.success) {
          setSession({
            user: data.user,
            dashboard: data.dashboard,
          });
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      }
    };

    hydrateSession();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ⏳ Prevent hydration mismatch
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground font-semibold">
          Loading dashboard…
        </p>
        <Loader className="ml-2 animate-spin" size={20} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6">
      <nav className="">
        <div className="mx-auto max-w-5xl flex items-center justify-end py-4">
          <LogoutButton />
        </div>
      </nav>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              Welcome Admin {user.email}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Super Admin:</p>
              <p className="font-medium">{user.superAdmin ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
