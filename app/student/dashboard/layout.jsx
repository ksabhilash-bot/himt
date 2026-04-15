import Script from "next/script";
export const metadata = {
  title: "student Dashboard | CampusDesk",
  description:
    "Student and college management of campusDesk, a comprehensive platform for managing student and college information, including admissions, courses, and campus activities.",
  keywords: [
    "CD",
    "CampusDesk",
    "Admin Dashboard",
    "Student Payment System",
  ],
};

export default function AdminDashboardLayout({ children }) {
  return (
    <section className="min-h-screen bg-muted">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {children}
    </section>
  );
}
