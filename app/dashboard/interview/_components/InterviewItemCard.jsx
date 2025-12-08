import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const InterviewItemCard = ({ interview }) => {
  return (
    <div className='border shadow-sm rounded-lg p-3 bg-white hover:shadow-md transition-all'>
        <h2 className='font-bold text-primary text-lg'>{interview?.jobPosition}</h2>
        <h2 className='text-sm text-gray-600'>{interview?.jobExperience} Years of Experience</h2>
        <h2 className='text-xs text-gray-400 mt-1'>Created At: {interview.createdAt}</h2>
        
        <div className='flex justify-between mt-4 gap-3'>
            {/* Feedback Button */}
            <Link href={'/dashboard/interview/'+interview?.mockId+"/feedback"} className="w-full">
                <Button size="sm" variant="outline" className="w-full">Feedback</Button>
            </Link>
            
            {/* Start Button */}
            <Link href={'/dashboard/interview/'+interview?.mockId} className="w-full">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Start</Button>
            </Link>
        </div>
    </div>
  )
}

export default InterviewItemCard