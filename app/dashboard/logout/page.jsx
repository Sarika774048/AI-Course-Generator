"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

function LogoutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    // Sign out and redirect to home page
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center border max-w-md w-full">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut className="h-10 w-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to leave?</h2>
        <p className="text-gray-500 mb-8">Are you sure you want to sign out of your account?</p>

        <div className="flex gap-4">
            <button 
                onClick={() => router.back()} // Go back to dashboard
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
                Cancel
            </button>
            <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 shadow-md transition-all"
            >
                Logout
            </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutPage;