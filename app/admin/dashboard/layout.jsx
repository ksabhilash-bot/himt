export const metadata = {
  title: "Admin Dashboard | HIMT",
  description:
    "Admin dashboard for Hindu Institute of Management & Technology, Rohtak",
  keywords: [
    "HIMT",
    "Hindu Institute Rohtak",
    "Admin Dashboard",
    "Student Payment System",
  ],
};

export default function AdminDashboardLayout({ children }) {
  return <section className="min-h-screen bg-muted">{children}</section>;
}
