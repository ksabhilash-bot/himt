"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader, Users, CreditCard, BookOpen, Settings } from "lucide-react";

import { useDashboardStore } from "@/zustandStore/useDashboardStore";
import { LogoutButton } from "@/components/Logout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const { user, isAuthenticated, loading, clearSession, setSession } =
    useDashboardStore();
  const router = useRouter();

  // 🔄 Hydrate session
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.success) {
          clearSession();
          router.replace("/login");
          return;
        }

        if (data.dashboard === "studentStyle") {
          router.replace("/student/dashboard");
          return;
        }

        setSession({
          user: data.user,
          dashboard: data.dashboard,
        });
      } catch {
        clearSession();
        router.replace("/login");
      }
    };

    hydrateSession();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2">
        <Loader className="animate-spin" size={20} />
        <span className="text-muted-foreground font-medium">
          Loading dashboard…
        </span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted">
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome, Admin</CardTitle>
            <CardDescription>
              Logged in as <span className="font-medium">{user.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Super Admin</p>
              <p className="font-medium">{user.superAdmin ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Actions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            What do you want to do?
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Admin Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings size={18} />
                  Admin Settings
                </CardTitle>
                <CardDescription>
                  Change admin roles & permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/adminSetting">Manage Admins</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users size={18} />
                  Students
                </CardTitle>
                <CardDescription>
                  Filter, add, update or delete students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/admin/students">Manage Students</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Semester Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard size={18} />
                  Semester Fees
                </CardTitle>
                <CardDescription>
                  Update semester-wise fee structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/semester-fees">Manage Fees</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen size={18} />
                  Courses
                </CardTitle>
                <CardDescription>Add or update course details</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/courses">Manage Courses</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard size={18} />
                  Payments
                </CardTitle>
                <CardDescription>
                  View payment history of students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/payments">View Payments</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
