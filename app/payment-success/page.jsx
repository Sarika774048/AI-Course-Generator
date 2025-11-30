"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const planType = searchParams.get('plan') || "Monthly"; // Get plan from URL

  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    // Only call if we have a user and haven't finished loading yet
    if (user && status === "loading") {
      activateSubscription();
    }
  }, [user]);

  const activateSubscription = async () => {
    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
          userName: user?.fullName,
          paymentId: `MOCK_PID_${Math.floor(Math.random() * 1000000)}`,
          plan: planType // 👈 Send the plan type to DB
        }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-gray-200">
        
        {/* LOADING STATE */}
        {status === "loading" && (
            <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-6" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Finalizing Subscription...</h1>
                <p className="text-gray-500">Please do not close this page.</p>
            </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
            <div className="animate-in zoom-in duration-500">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-2">You are now a <span className="font-bold text-purple-600">{planType}</span> member.</p>
                <p className="text-sm text-gray-400 mb-8">A receipt has been sent to your email.</p>
                
                <Link href="/create-course">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl shadow-lg transition-transform active:scale-95">
                        Start Creating Courses
                    </Button>
                </Link>
            </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
            <div>
                 <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                 <h1 className="text-2xl font-bold text-red-600 mb-2">Activation Failed</h1>
                 <p className="text-gray-500 mb-6">We received your payment but couldn't update your account automatically.</p>
                 <Link href="/dashboard">
                    <Button variant="outline">Contact Support</Button>
                 </Link>
            </div>
        )}

      </div>
    </div>
  );
}