"use client"
import { db } from '@/configs/db'
import { UserAnswer } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState, use } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, CheckCircle2, XCircle, AlertCircle, Star } from 'lucide-react' // Added Icons
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown' // Import the markdown renderer

const Feedback = ({ params }) => {
    const unwrappedParams = use(params);
    const interviewId = unwrappedParams.interviewId;

    const [feedbackList, setFeedbackList] = useState([]);
    const router = useRouter();

    useEffect(() => {
        GetFeedback();
    }, [interviewId]);

    const GetFeedback = async () => {
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, interviewId))
            .orderBy(UserAnswer.id);

        setFeedbackList(result);
    }

    // Calculate rating details
    const overallRating = feedbackList.length > 0
        ? (feedbackList.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / feedbackList.length).toFixed(1)
        : 0;
        
    const getRatingColor = (rating) => {
        if(rating >= 8) return 'text-green-500';
        if(rating >= 5) return 'text-yellow-500';
        return 'text-red-500';
    }

    return (
        <div className='p-10 bg-gray-50 min-h-screen'>
            {feedbackList?.length === 0 ?
                <div className='flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm'>
                    <h2 className='font-bold text-xl text-gray-500'>No Interview Feedback Record Found</h2>
                    <Button onClick={() => router.replace('/dashboard')} className="mt-5">Go Back Home</Button>
                </div>
                :
                <div className='max-w-4xl mx-auto'>
                    {/* Header Section */}
                    <div className='mb-8'>
                        <h2 className='text-3xl font-bold text-green-600 mb-2'>Congratulations!</h2>
                        <h2 className='font-bold text-2xl text-gray-800'>Here is your interview result</h2>
                        
                        <div className='p-4 bg-white rounded-lg border shadow-sm mt-4 flex items-center justify-between'>
                             <h2 className='text-gray-700 text-lg'>
                                Overall Interview Rating: 
                                <span className={`font-bold text-2xl ml-2 ${getRatingColor(overallRating)}`}>
                                    {overallRating}/10
                                </span>
                            </h2>
                            {Number(overallRating) < 5 ? 
                                <span className='text-red-500 text-sm'>Needs Improvement</span> : 
                                <span className='text-green-500 text-sm'>Good Job!</span>
                            }
                        </div>

                        <h2 className='text-sm text-gray-500 mt-5'>
                            Find below the interview questions with correct answers, your responses, and feedback for improvement.
                        </h2>
                    </div>

                    {/* Questions List */}
                    <div className='space-y-4'>
                        {feedbackList.map((item, index) => (
                            <Collapsible key={index} className='bg-white border rounded-lg shadow-sm overflow-hidden'>
                                <CollapsibleTrigger className='p-4 w-full flex justify-between items-center hover:bg-gray-50 transition-all text-left'>
                                    <div className='flex gap-3 items-center'>
                                        <span className='font-bold text-lg text-primary w-6'>{index + 1}.</span>
                                        <span className='font-medium text-gray-800 w-[90%]'>{item.question}</span>
                                    </div>
                                    <ChevronsUpDown className='h-5 w-5 text-gray-400' />
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className='p-5 border-t bg-slate-50'>
                                    <div className='flex flex-col gap-4'>
                                        
                                        {/* Rating Badge */}
                                        <div className='flex justify-end'>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                                Number(item.rating) >= 5 
                                                ? 'bg-green-100 text-green-700 border-green-200' 
                                                : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                Rating: {item.rating}/10
                                            </span>
                                        </div>

                                        {/* User Answer Card */}
                                        <div className='p-4 rounded-lg bg-red-50 border border-red-100'>
                                            <div className='flex items-center gap-2 mb-2 text-red-700 font-semibold'>
                                                <XCircle className='h-5 w-5'/>
                                                <span>Your Answer:</span>
                                            </div>
                                            <p className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                                                {item.userAns}
                                            </p>
                                        </div>

                                        {/* Correct Answer Card */}
                                        <div className='p-4 rounded-lg bg-green-50 border border-green-100'>
                                            <div className='flex items-center gap-2 mb-2 text-green-700 font-semibold'>
                                                <CheckCircle2 className='h-5 w-5'/>
                                                <span>Correct Answer / AI Suggested:</span>
                                            </div>
                                            <div className='text-sm text-gray-700 leading-7'>
                                                {/* This renders the **Bold** and Lists correctly */}
                                                <ReactMarkdown>
                                                    {item.correctAns}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Feedback Card */}
                                        <div className='p-4 rounded-lg bg-blue-50 border border-blue-100'>
                                            <div className='flex items-center gap-2 mb-2 text-blue-700 font-semibold'>
                                                <AlertCircle className='h-5 w-5'/>
                                                <span>Feedback:</span>
                                            </div>
                                            <div className='text-sm text-gray-700'>
                                                 <ReactMarkdown>
                                                    {item.feedback}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </div>
            }

            <div className='flex justify-center mt-10'>
                <Button onClick={() => router.replace('/dashboard')}>
                    Start New Interview
                </Button>
            </div>
        </div>
    )
}

export default Feedback