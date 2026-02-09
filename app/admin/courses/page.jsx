"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Loader,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";

export default function Page() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCode, setDeleteCode] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user, isAuthenticated, clearSession, setSession } =
    useDashboardStore();

  // Hydration of session on page load
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

  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    totalSemesters: "",
    durationYears: "",
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/course", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const deleteCourse = async () => {
    try {
      const res = await fetch("/api/admin/course", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: deleteCode }),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message);
      toast.success("Course deleted");
      setDeleteCode(null);
      setCurrentIndex(0);
      fetchCourses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const addCourse = async () => {
    try {
      const res = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message);
      toast.success("Course added");
      setForm({
        courseCode: "",
        courseName: "",
        totalSemesters: "",
        durationYears: "",
      });
      fetchCourses();
    } catch {
      toast.error("Failed to add course");
    }
  };

  const nextCourse = () => {
    setCurrentIndex((prev) => (prev + 1) % courses.length);
  };

  const prevCourse = () => {
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Course Management
          </h1>
          <p className="text-slate-600">Manage and organize your courses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT – COURSE CAROUSEL */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-lg border-b-2 bg-white/80 backdrop-blur">
              <CardHeader className="border-b bg-background text-zinc flex-1 justify-center py-2">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6" />
                  Courses ({courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No courses found</p>
                    <p className="text-slate-400 text-sm mt-2">
                      Add your first course to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Carousel View */}
                    <div className="hidden md:block">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-100 shadow-sm">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-2xl font-bold text-blue-900 mb-1">
                                {courses[currentIndex].courseCode}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                Course Code
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteCode(courses[currentIndex].courseCode)
                              }
                              className="shadow-md hover:shadow-lg transition-shadow"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                Course Name
                              </p>
                              <p className="text-lg font-semibold text-slate-800">
                                {courses[currentIndex].courseName}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                                    Semesters
                                  </p>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">
                                  {courses[currentIndex].totalSemesters}
                                </p>
                              </div>

                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-indigo-600" />
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                                    Duration
                                  </p>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600">
                                  {courses[currentIndex].durationYears} Years
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-6">
                          <Button
                            variant="outline"
                            onClick={prevCourse}
                            disabled={courses.length <= 1}
                            className="shadow-sm hover:shadow-md transition-all"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </Button>

                          <div className="text-sm text-slate-600 font-medium">
                            {currentIndex + 1} / {courses.length}
                          </div>

                          <Button
                            variant="outline"
                            onClick={nextCourse}
                            disabled={courses.length <= 1}
                            className="shadow-sm hover:shadow-md transition-all"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {courses.map((course) => (
                        <div
                          key={course.courseCode}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-100 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-blue-900">
                                {course.courseCode}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {course.courseName}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteCode(course.courseCode)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded p-2">
                              <p className="text-xs text-slate-500">
                                Semesters
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {course.totalSemesters}
                              </p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <p className="text-xs text-slate-500">Duration</p>
                              <p className="text-lg font-bold text-indigo-600">
                                {course.durationYears} Years
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT – ADD COURSE */}
          <div className="order-1 lg:order-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur sticky top-6">
              <CardHeader className="border-b bg-background flex-1 justify-center py-2 from-indigo-600 to-indigo-700 text-black">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Add New Course
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="courseCode"
                    className="text-slate-700 font-medium"
                  >
                    Course Code
                  </Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., CS101"
                    value={form.courseCode}
                    onChange={(e) =>
                      setForm({ ...form, courseCode: e.target.value })
                    }
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="courseName"
                    className="text-slate-700 font-medium"
                  >
                    Course Name
                  </Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Introduction to Computer Science"
                    value={form.courseName}
                    onChange={(e) =>
                      setForm({ ...form, courseName: e.target.value })
                    }
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="totalSemesters"
                      className="text-slate-700 font-medium"
                    >
                      Total Semesters
                    </Label>
                    <Input
                      id="totalSemesters"
                      type="number"
                      placeholder="8"
                      value={form.totalSemesters}
                      onChange={(e) =>
                        setForm({ ...form, totalSemesters: e.target.value })
                      }
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="durationYears"
                      className="text-slate-700 font-medium"
                    >
                      Duration (Years)
                    </Label>
                    <Input
                      id="durationYears"
                      type="number"
                      placeholder="4"
                      value={form.durationYears}
                      onChange={(e) =>
                        setForm({ ...form, durationYears: e.target.value })
                      }
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={addCourse}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* DELETE ALERT */}
      <AlertDialog open={!!deleteCode} onOpenChange={() => setDeleteCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The course will be permanently
              removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
