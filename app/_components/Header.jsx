"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

const Header = () => {
  // 1. Get user status from Clerk
  const { user, isSignedIn } = useUser();

  return (
    <div className="flex justify-between items-center px-10 py-5 shadow-sm backdrop-blur-lg bg-white/60 sticky top-0 z-50">
      <div className="flex gap-3 items-center">
        <Image 
            className="w-12 h-12 rounded-full" 
            src={'/actual.webp'} 
            width={50} 
            height={50} 
            alt="logo"
        />
        <h2 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-blue-900 to-indigo-600 text-transparent bg-clip-text drop-shadow-sm">
          FutureLearn AI
        </h2>
      </div>

      {/* 2. Wrap Button in Link */}
      <Link href={isSignedIn ? "/dashboard" : "/dashboard"}>
          <Button className="rounded-full px-6 py-2 shadow-md hover:shadow-lg transition">
            {/* 3. Change Text based on Login Status */}
            {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
          </Button>
      </Link>

    </div>
  )
}

export default Header