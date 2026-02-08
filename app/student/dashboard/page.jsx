"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { LogoutButton } from "@/components/Logout";
import SemesterFees from "@/components/SemesterFees";

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

        if (data.dashboard === "adminStyle") {
          setSession({
            user: data.user,
            dashboard: "adminStyle",
          });
          router.push("/admin/dashboard");
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
    <div className="min-h-screen bg-muted px-2 sm:px-6 ">
      <header className="sticky top-0 z-10 bg-background border-b mb-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Student Dashboard</h1>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader className={`flex flex-row items-center gap-4`}>
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
              {user.name.charAt(0)}
            </div>
            <div></div>
            <CardTitle className="text-xl sm:text-2xl">
              Welcome, {user.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-medium">{user.courseCode}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Start Year</p>
              <p className="font-medium">{user.sessionStartYear}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">End Year</p>
              <p className="font-medium">{user.sessionEndYear}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Roll No</p>
              <p className="font-medium">{user.rollNo}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Current Semester</p>
              <p className="font-medium">Semester {user.currentSemester}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <SemesterFees />
    </div>
  );
}
