"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailure() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center p-10 max-w-lg">
        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-gray-600 text-lg mb-8">
          We couldn't process your transaction. No charges were made.
        </p>
        
        <div className="flex gap-4 justify-center">
            <Link href="/dashboard/upgrade">
                <Button variant="outline">Try Again</Button>
            </Link>
            <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}