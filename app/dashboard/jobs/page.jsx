"use client"
import React, { useEffect, useState } from 'react'
import PostNewJob from './_components/PostNewJob'
import { db } from '@/configs/db'
import { JobListing } from '@/configs/schema'
import { desc } from 'drizzle-orm'
import JobItem from './_components/JobItem'

const Jobs = () => {
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    GetJobs();
  },[])

  const GetJobs = async () => {
    setLoading(true);
    try {
        const result = await db.select()
        .from(JobListing)
        .orderBy(desc(JobListing.id));
        
        setJobList(result);
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
    setLoading(false);
  }

  return (
    <div className='p-10'>
        <div className='flex justify-between items-center mb-5'>
            <div>
                <h2 className='font-bold text-3xl text-primary'>Job Portal</h2>
                <h2 className='text-gray-500'>Find your dream job or post a new opportunity</h2>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {/* The "Add New" Button */}
            <PostNewJob refreshData={GetJobs} />

            {/* List of Jobs */}
            {loading ? (
                 [1,2,3,4].map((item,index)=>(
                    <div key={index} className='h-[250px] w-full bg-slate-200 animate-pulse rounded-lg'></div>
                 ))
            ) : (
                jobList.length > 0 ? jobList.map((job, index) => (
                    <JobItem key={index} job={job} />
                )) : 
                // Show message if only the "Post Job" button exists
                <div className='flex items-center justify-center text-gray-400'>
                    No jobs posted yet. Be the first!
                </div>
            )}
        </div>
    </div>
  )
}

export default Jobs