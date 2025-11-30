import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

const Header = () => {
  return (
    <div className="flex justify-between items-center border-b shadow-sm p-5.5">
     <h2 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-900 to-indigo-600 text-transparent bg-clip-text drop-shadow-sm">
          FutureLearn AI
        </h2>
      <UserButton/>
    </div>
  )
}

export default Header