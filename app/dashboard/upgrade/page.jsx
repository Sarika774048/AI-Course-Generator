"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "@/configs/db";
import { CourseLayout, UserSubscription } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";

export default function UpgradePage() {
  const { user } = useUser();
  const router = useRouter();
  const [userCourses, setUserCourses] = useState(0);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (user) checkUsage();
  }, [user]);

  const checkUsage = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    
    // Check Course Count
    const courses = await db.select().from(CourseLayout).where(eq(CourseLayout.createdBy, email));
    setUserCourses(courses.length);

    // Check Subscription
    const subscription = await db.select().from(UserSubscription).where(eq(UserSubscription.email, email));
    if (subscription.length > 0 && subscription[0].active) {
      setIsPro(true);
    }
  };

  const handleCheckout = (price, plan) => {
    router.push(`/mock-payment?price=${price}&plan=${plan}`);
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-bold text-4xl text-center mb-4 text-gray-800">Upgrade Your Learning</h2>
        <p className="text-center text-gray-500 mb-12 text-lg">Choose the plan that fits your learning journey.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* FREE PLAN */}
          <div className="border rounded-2xl p-8 shadow-sm bg-white hover:shadow-md transition-all flex flex-col">
            <h3 className="font-bold text-xl text-gray-600 mb-2">Free</h3>
            <div className="mb-6">
                 <span className="text-4xl font-extrabold">$0</span>
                 <span className="text-gray-500">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-green-500 w-5 h-5"/> 5 Course Generations</li>
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-green-500 w-5 h-5"/> Standard Processing</li>
              <li className="flex gap-3 text-gray-400 text-sm"><X className="text-gray-400 w-5 h-5"/> No Priority Support</li>
            </ul>
            <Button variant="outline" className="w-full py-6 rounded-xl border-gray-300" disabled={true}>
              {isPro ? "Free Plan" : "Current Plan"}
            </Button>
          </div>

          {/* MONTHLY PLAN */}
          <div className="border border-purple-200 rounded-2xl p-8 shadow-lg bg-white flex flex-col relative">
            <h3 className="font-bold text-xl text-purple-600 mb-2">Monthly</h3>
            <div className="mb-6">
                 <span className="text-4xl font-extrabold">$9.99</span>
                 <span className="text-gray-500">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-purple-600 w-5 h-5"/> <b>Unlimited</b> Generations</li>
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-purple-600 w-5 h-5"/> Faster AI Models</li>
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-purple-600 w-5 h-5"/> Priority Support</li>
            </ul>
            <Button 
              className="w-full py-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => handleCheckout(9.99, "Monthly")}
              disabled={isPro}
            >
              {isPro ? "Active" : "Start Monthly"}
            </Button>
          </div>

          {/* YEARLY PLAN */}
          <div className="border-2 border-fuchsia-500 rounded-2xl p-8 shadow-xl bg-gradient-to-b from-white to-fuchsia-50 flex flex-col relative transform scale-105 z-10">
            <div className="absolute top-0 right-0 bg-fuchsia-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg flex gap-1 items-center">
               <Sparkles className="w-3 h-3"/> BEST VALUE
            </div>
            <h3 className="font-bold text-xl text-fuchsia-700 mb-2">Yearly</h3>
            <div className="mb-1">
                 <span className="text-4xl font-extrabold">$39.99</span>
                 <span className="text-gray-500">/yr</span>
            </div>
            <p className="text-xs text-fuchsia-600 font-semibold mb-5 bg-fuchsia-100 inline-block px-2 py-1 rounded">Save 66%</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-fuchsia-600 w-5 h-5"/> <b>Everything in Monthly</b></li>
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-fuchsia-600 w-5 h-5"/> Early Feature Access</li>
              <li className="flex gap-3 text-gray-700 text-sm"><Check className="text-fuchsia-600 w-5 h-5"/> 1-on-1 Onboarding</li>
            </ul>
            <Button 
              className="w-full py-6 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-200"
              onClick={() => handleCheckout(39.99, "Yearly")}
              disabled={isPro}
            >
              {isPro ? "Active" : "Get Yearly Access"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}