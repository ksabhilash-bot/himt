"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";
import { Loader } from "lucide-react";

const SemesterFees = () => {
  const [sem, setSem] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useDashboardStore();

  useEffect(() => {
    const fetchSemesterFees = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/student/semesterFee", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.message);
          return;
        }

        setSem(data.data);
      } catch (error) {
        console.error("error in semesterFee component", error);
        toast.error("Failed to fetch semester fees");
      } finally {
        setLoading(false);
      }
    };

    fetchSemesterFees();
  }, []);

  const handlePay = async ({ semester, courseCode, amount }) => {
    toast.success(`Redirecting to payment gateway for Semester ${semester}...`);
    
    try {
      const res = await fetch(`/api/student/payment/createOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ semester, courseCode, amount }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data?.message);
        return;
      }
      if (data.success) {
        toast.success(data?.message);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
    // later: router.push(`/payment/${semesterId}`)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-lg font-semibold">Loading...</p>
        <Loader className="animate-spin ml-2" size={24} />
      </div>
    );
  }

  return (
    <div className="min-w-full p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Semester Fees</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sem.map((item) => {
          const {
            _id,
            semester,
            courseCode,
            SemesterFees,
            amountPaid,
            status,
            sessionStartYear,
          } = item;

          const pendingPayment =
            amountPaid !== SemesterFees &&
            (status === "PENDING" || status === "PARTIAL");

          return (
            <Card key={_id} className="shadow-md">
              <CardHeader>
                <CardTitle>
                  Semester {semester} – {courseCode}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p>
                  <span className="font-semibold">Session Year:</span>{" "}
                  {sessionStartYear}
                </p>

                <p>
                  <span className="font-semibold">Total Fee:</span> ₹
                  {SemesterFees}
                </p>

                <p>
                  <span className="font-semibold">Amount Paid:</span> ₹
                  {amountPaid}
                </p>

                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`font-semibold ${
                      status === "PAID" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                </p>

                {pendingPayment && (
                  <Button
                    className={`w-full mt-4 hover:text-zinc-950 font-semibold ${user?.currentSemester === semester ? "" : "cursor-not-allowed opacity-50"}  ${status === "PAID" ? "hidden" : ""}`}
                    onClick={() =>
                      handlePay({
                        semester,
                        courseCode,
                        amount: SemesterFees - amountPaid,
                      })
                    }
                  >
                    Pay Now
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SemesterFees;
