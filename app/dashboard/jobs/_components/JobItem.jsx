import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, Clock, DollarSign } from 'lucide-react'
import React from 'react'

const JobItem = ({ job }) => {
  return (
    <div className='p-5 border rounded-lg bg-white shadow-sm hover:border-primary transition-all hover:shadow-md'>
        <div className='flex justify-between items-start'>
            <div>
                <h2 className='font-bold text-lg text-primary'>{job.positionTitle}</h2>
                <h2 className='text-sm text-gray-600 font-semibold'>{job.companyName}</h2>
            </div>
            {/* Badge */}
            <span className='px-3 py-1 text-xs text-primary bg-blue-100 rounded-full font-medium'>
                {job.jobType}
            </span>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-3 text-sm text-gray-500'>
            <div className='flex gap-2 items-center'>
                <MapPin className='h-4 w-4'/> {job.location}
            </div>
            <div className='flex gap-2 items-center'>
                <Briefcase className='h-4 w-4'/> {job.experience} Exp
            </div>
            {job.salary && 
                <div className='flex gap-2 items-center'>
                    <DollarSign className='h-4 w-4'/> {job.salary}
                </div>
            }
            <div className='flex gap-2 items-center'>
                <Clock className='h-4 w-4'/> Posted: {job.createdAt}
            </div>
        </div>

        <div className='mt-4'>
             <p className='text-xs text-gray-500 line-clamp-3 mb-4'>
                {job.jobDescription}
             </p>
             <Button className="w-full" size="sm">Apply Now / View Details</Button>
        </div>
    </div>
  )
}

export default JobItem