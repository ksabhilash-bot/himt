import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="mx-auto max-w-5xl px-6 py-20">
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-6">
          <Image
            src="/images.png"
            alt="HIMT Logo"
            width={110}
            height={110}
            priority
            className="dark:invert"
          />

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Hindu Institute of Management & Technology
          </h1>

          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Empowering students to become leaders, achievers, and global
            professionals in technology and management.
          </p>

          <Link
            size="lg"
            href={"/student/login"}
            className="rounded-full px-8 text-amber-50 p-2 bg-zinc-950 hover:text-zinc-950 hover:font-bold hover:bg-zinc-300 "
          >
            Student Login
          </Link>
        </header>

        {/* Mission & Vision */}
        <section className="mt-20 grid gap-8 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hindu Institute of Management & Technology, Rohtak aims to create
              leaders, winners, and achievers in the field of information
              technology and management who can compete in the global corporate
              world. The institution strives to understand student needs and
              provide meaningful, career-oriented education.
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The promoters are committed to continuous improvement in the
              quality of education through innovative delivery systems and a
              supportive academic environment. The vision is to achieve high
              academic standards, excellence in technical and management
              education, and personal integrity for the all-round development of
              students.
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-sm text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} Hindu Institute of Management &
          Technology, Rohtak
        </footer>
      </main>
    </div>
  );
}
