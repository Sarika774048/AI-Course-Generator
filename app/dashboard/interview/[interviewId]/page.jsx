"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/configs/db'
import { MockInterview } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, use } from 'react' // Import 'use'
import Webcam from 'react-webcam'

const Interview = ({ params }) => {
    // 1. Unwrap the params using React.use()
    const unwrappedParams = use(params);
    const interviewId = unwrappedParams.interviewId;

    const [interviewData, setInterviewData] = useState();
    const [webCamEnabled, setWebCamEnabled] = useState(false);

    useEffect(() => {
        GetInterviewDetails();
    }, [interviewId]); // Add interviewId dependency

    const GetInterviewDetails = async () => {
        // Use the unwrapped interviewId
        const result = await db.select().from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId))
        setInterviewData(result[0]);
    }

    return (
        <div className='my-10 flex justify-center flex-col items-center'>
            <h2 className='font-bold text-2xl'>Let's Get Started</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-10 w-full px-10'>
                {/* Details Section */}
                <div className='flex flex-col gap-5'>
                    <div className='flex flex-col p-5 rounded-lg border gap-5 bg-white shadow-sm'>
                        <h2 className='text-lg'><strong>Job Role/Position:</strong> {interviewData?.jobPosition} </h2>
                        <h2 className='text-lg'><strong>Job Description/Tech Stack:</strong> {interviewData?.jobDesc} </h2>
                        <h2 className='text-lg'><strong>Years of Experience:</strong> {interviewData?.jobExperience} </h2>
                    </div>
                    <div className='p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
                        <h2 className='flex gap-2 items-center text-yellow-500'> <Lightbulb /> <strong>Information</strong></h2>
                        <h2 className='mt-3 text-yellow-500'>Enable Video Web Cam and Microphone to Start your AI Generated Mock Interview. It Has 5 questions which you can answer and at the last you will get the report on the basis of your answer. NOTE: We never record your video, Web cam access is just for simulation.</h2>
                    </div>
                </div>

                {/* Webcam Section */}
                <div className='flex flex-col items-center justify-center bg-black/5 rounded-lg p-5'>
                    {webCamEnabled ?
                        <Webcam
                            onUserMedia={() => setWebCamEnabled(true)}
                            onUserMediaError={() => setWebCamEnabled(false)}
                            mirrored={true}
                            style={{ height: 300, width: 300 }}
                        />
                        :
                        <>
                            <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
                            <Button variant="ghost" className="w-full" onClick={() => setWebCamEnabled(true)}>Enable Web Cam and Microphone</Button>
                        </>
                    }
                </div>
            </div>
            <div className='flex justify-end items-end w-full px-10 mt-5'>
                {/* Use the unwrapped interviewId variable here */}
                <Link href={'/dashboard/interview/' + interviewId + '/start'}>
                    <Button>Start Interview</Button>
                </Link>
            </div>
        </div>
    )
}

export default Interview;