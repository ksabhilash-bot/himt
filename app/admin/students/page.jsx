"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Filter, RefreshCw, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentManagementPage() {
  const { isAuthenticated, dashboard, setSession, clearSession } =
    useDashboardStore();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingRollNo, setDeletingRollNo] = useState(null);
  const [isDeleteSingleDialogOpen, setIsDeleteSingleDialogOpen] =
    useState(false);
  const [isDeleteBatchDialogOpen, setIsDeleteBatchDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [filter, setFilter] = useState({
    courseCode: "",
    sessionStartYear: "",
    sessionEndYear: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    rollNo: "",
    courseCode: "",
    sessionStartYear: "",
    sessionEndYear: "",
  });

  // Fetch available courses for dropdowns
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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
          fetchCourses();
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

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await fetch("/api/admin/course", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        setCourses(data?.courses);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (
      !filter.courseCode ||
      !filter.sessionStartYear ||
      !filter.sessionEndYear
    ) {
      toast.error("Please fill all filter fields");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        courseCode: filter.courseCode,
        sessionStartYear: filter.sessionStartYear,
        sessionEndYear: filter.sessionEndYear,
      });

      const res = await fetch(`/api/admin/student?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStudents(data.students || []);
        toast.success(`Loaded ${data.students?.length || 0} students`);
      } else {
        toast(data.message || "Failed to fetch students");
      }
    } catch (err) {
      console.error("Fetch students error:", err);
      toast.error(err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
    // Reset students when filter changes
    if (students.length > 0) setStudents([]);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateCreateForm = () => {
    const requiredFields = [
      "name",
      "email",
      "password",
      "phone",
      "rollNo",
      "courseCode",
      "sessionStartYear",
      "sessionEndYear",
    ];

    for (const field of requiredFields) {
      if (!createForm[field]?.trim()) {
        toast.error(
          `Please fill ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email.trim())) {
      toast.error("Invalid email format");
      return false;
    }

    // Phone validation (basic)
    if (!/^\d{10}$/.test(createForm.phone.trim())) {
      toast.error("Phone must be 10 digits");
      return false;
    }

    // Session year validation
    const startYear = parseInt(createForm.sessionStartYear);
    const endYear = parseInt(createForm.sessionEndYear);
    if (startYear >= endYear) {
      toast.error("Session start year must be less than end year");
      return false;
    }

    // Password length
    if (createForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCreateForm()) return;

    try {
      setFormLoading(true);
      const payload = {
        ...createForm,
        sessionStartYear: parseInt(createForm.sessionStartYear),
        sessionEndYear: parseInt(createForm.sessionEndYear),
      };

      const res = await fetch("/api/admin/student", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create student");
      }

      toast.success("Student created successfully!");
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        rollNo: "",
        courseCode: "",
        sessionStartYear: "",
        sessionEndYear: "",
      });

      // Auto-refresh if current filter matches new student
      if (
        filter.courseCode === payload.courseCode &&
        filter.sessionStartYear === payload.sessionStartYear.toString() &&
        filter.sessionEndYear === payload.sessionEndYear.toString()
      ) {
        fetchStudents();
      }
    } catch (err) {
      console.error("Create student error:", err);
      toast.error(err.message || "Failed to create student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!studentToDelete) return;

    setActionLoading(true);
    setDeletingRollNo(studentToDelete.rollNo);

    try {
      const res = await fetch("/api/admin/student", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: studentToDelete.rollNo,
          email: studentToDelete.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete student");
      }

      toast.success("Student deleted successfully");
      setStudents((prev) =>
        prev.filter((s) => s.rollNo !== studentToDelete.rollNo),
      );
      setIsDeleteSingleDialogOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error("Delete student error:", err);
      toast.error(err.message || "Failed to delete student");
    } finally {
      setActionLoading(false);
      setDeletingRollNo(null);
    }
  };

  const handleDeleteBatch = async () => {
    if (
      !filter.courseCode ||
      !filter.sessionStartYear ||
      !filter.sessionEndYear
    ) {
      toast.error("Filter not properly set");
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/student", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: filter.courseCode,
          sessionStartYear: parseInt(filter.sessionStartYear),
          sessionEndYear: parseInt(filter.sessionEndYear),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete students");
      }

      toast.success("All students in batch deleted successfully");
      setStudents([]);
      setIsDeleteBatchDialogOpen(false);
    } catch (err) {
      console.error("Delete batch error:", err);
      toast.error(err.message || "Failed to delete students");
    } finally {
      setActionLoading(false);
    }
  };

  const studentEdit = (rollNo) => {
    setLoading(true);
    router.push(`students/${rollNo}`);
    setLoading(false);
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Student Management
        </h1>
        <p className="text-muted-foreground">
          Register new students and manage existing student records
        </p>
      </div>

      {/* Create Student Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Register New Student
          </CardTitle>
          <CardDescription>
            Enter student details to create a new account. All fields are
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={createForm.name}
                onChange={handleCreateChange}
                placeholder="John Doe"
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={createForm.email}
                onChange={handleCreateChange}
                placeholder="student@example.com"
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={createForm.password}
                onChange={handleCreateChange}
                placeholder="Min 6 characters"
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={createForm.phone}
                onChange={handleCreateChange}
                placeholder="10 digits"
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                name="rollNo"
                value={createForm.rollNo}
                onChange={handleCreateChange}
                placeholder="e.g. BCA2024001"
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course</Label>
              <Select
                value={createForm.courseCode}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, courseCode: value }))
                }
                disabled={coursesLoading || formLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesLoading ? (
                    <div className="p-2 text-center text-muted-foreground">
                      Loading courses...
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      No courses available
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem
                        key={course.courseCode}
                        value={course.courseCode}
                      >
                        {course.courseName} ({course.courseCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionStartYear">Session Start Year</Label>
              <Input
                id="sessionStartYear"
                name="sessionStartYear"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 5}
                value={createForm.sessionStartYear}
                onChange={handleCreateChange}
                placeholder="2024"
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionEndYear">Session End Year</Label>
              <Input
                id="sessionEndYear"
                name="sessionEndYear"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 10}
                value={createForm.sessionEndYear}
                onChange={handleCreateChange}
                placeholder="2027"
                required
                disabled={formLoading}
              />
            </div>
            <div className="lg:col-span-4 flex justify-end pt-2">
              <Button
                type="submit"
                disabled={formLoading || coursesLoading}
                size="lg"
              >
                {formLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating Student...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Filter and Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            Filter students by course and academic session to view or manage
            records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="filterCourse">Course</Label>
              <Select
                value={filter.courseCode}
                onValueChange={(value) =>
                  handleFilterChange("courseCode", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesLoading ? (
                    <div className="p-2 text-center text-muted-foreground">
                      Loading courses...
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      No courses available
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem
                        key={course.courseCode}
                        value={course.courseCode}
                      >
                        {course.courseName} ({course.courseCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterStartYear">Session Start Year</Label>
              <Input
                id="filterStartYear"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 5}
                value={filter.sessionStartYear}
                onChange={(e) =>
                  handleFilterChange("sessionStartYear", e.target.value)
                }
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterEndYear">Session End Year</Label>
              <Input
                id="filterEndYear"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 10}
                value={filter.sessionEndYear}
                onChange={(e) =>
                  handleFilterChange("sessionEndYear", e.target.value)
                }
                placeholder="2027"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchStudents}
                disabled={
                  loading ||
                  !filter.courseCode ||
                  !filter.sessionStartYear ||
                  !filter.sessionEndYear
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filter
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Batch Delete Button */}
          {students.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteBatchDialogOpen(true)}
                disabled={actionLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Entire Batch ({students.length} students)
              </Button>
            </div>
          )}

          {/* Students Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-30">Roll No</TableHead>
                  <TableHead className="min-w-37.5">Name</TableHead>
                  <TableHead className="min-w-50">Email</TableHead>
                  <TableHead className="min-w-30">Phone</TableHead>
                  <TableHead className="min-w-25 text-center">
                    Session
                  </TableHead>
                  <TableHead className="min-w-25 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <UserPlus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md">
                          No students found for this course and session. Apply
                          filter to load students or register new students
                          above.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.rollNo}>
                      <TableCell className="font-medium">
                        {student.rollNo}
                      </TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {student.sessionStartYear}-{student.sessionEndYear}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-evenly">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteSingleDialogOpen(true);
                          }}
                          disabled={
                            actionLoading || deletingRollNo === student.rollNo
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingRollNo === student.rollNo
                            ? "Deleting..."
                            : "Delete"}
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => studentEdit(student.rollNo)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Single Student Dialog */}
      <AlertDialog
        open={isDeleteSingleDialogOpen}
        onOpenChange={(open) => {
          if (!open) setStudentToDelete(null);
          setIsDeleteSingleDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-6 w-6" />
              Delete Student Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium">{studentToDelete?.name}</span> (
              <span className="font-mono">{studentToDelete?.rollNo}</span>)?
              This action cannot be undone and will permanently remove:
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Student account and personal information</li>
                <li>All payment records</li>
                <li>Fee structure assignments</li>
              </ul>
              <p className="mt-3 font-medium text-destructive flex items-center gap-1">
                <AlertDialogTitle className="h-4 w-4" />
                This action is irreversible!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              className="bg-destructive hover:bg-destructive/90"
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Batch Dialog */}
      <AlertDialog
        open={isDeleteBatchDialogOpen}
        onOpenChange={setIsDeleteBatchDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-6 w-6" />
              Delete Entire Student Batch?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              This will permanently delete{" "}
              <span className="font-bold">{students.length} students</span> from{" "}
              <span className="font-medium">{filter.courseCode}</span> course (
              <span className="font-medium">
                {filter.sessionStartYear}-{filter.sessionEndYear}
              </span>
              ) session including:
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>All student accounts</li>
                <li>All payment histories</li>
                <li>All fee records</li>
              </ul>
              <p className="mt-3 font-medium text-destructive flex items-center gap-1">
                <AlertDialogTitle className="h-4 w-4" />
                This action is irreversible and cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBatch}
              className="bg-destructive hover:bg-destructive/90"
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting Batch..." : "Delete Entire Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
