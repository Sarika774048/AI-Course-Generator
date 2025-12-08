"use client"
import { Button } from '@/components/ui/button'
import { Download, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ResumeHeader = ({ onDownload }) => {
  return (
    <div className='flex justify-between items-center p-4 shadow-md bg-white rounded-lg mb-5 print:hidden'>
        {/* Left: Home Button */}
        <Link href='/dashboard/resume'>
            <Button variant="outline" className="flex gap-2">
                <Home size={18}/> Home
            </Button>
        </Link>

        {/* Right: Download Button */}
        <div className='flex gap-3'>
            <Button onClick={onDownload} className="flex gap-2 bg-purple-600 hover:bg-purple-700">
                <Download size={18}/> Download / Print
            </Button>
        </div>
    </div>
  )
}

export default ResumeHeader