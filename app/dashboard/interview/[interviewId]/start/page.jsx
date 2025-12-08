"use client"
import { db } from '@/configs/db';
import { MockInterview } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState, use } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // 1. Import dynamic

// 2. Dynamically import RecordAnswerSection with SSR disabled
const RecordAnswerSection = dynamic(
    () => import('./_components/RecordAnswerSection'),
    { ssr: false }
);

const StartInterview = ({ params }) => {
    const unwrappedParams = use(params);
    const interviewId = unwrappedParams.interviewId;

    const [interviewData, setInterviewData] = useState();
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    useEffect(() => {
        GetInterviewDetails();
    }, [interviewId]);

    const GetInterviewDetails = async () => {
        const result = await db.select().from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId))

        if (result.length > 0) {
            const jsonMockResp = JSON.parse(result[0].jsonMockResp);
            setMockInterviewQuestion(jsonMockResp);
            setInterviewData(result[0]);
        }
    }

    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {/* Questions */}
                <QuestionsSection
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                />

                {/* Video/Audio Recording - Now Safe from "window is not defined" */}
                <RecordAnswerSection
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    interviewData={interviewData}
                />
            </div>
            <div className='flex justify-end gap-6 mt-5'>
                {activeQuestionIndex > 0 &&
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>Previous Question</Button>}

                {activeQuestionIndex != mockInterviewQuestion?.length - 1 &&
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>Next Question</Button>}

                {activeQuestionIndex == mockInterviewQuestion?.length - 1 &&
                    <Link href={'/dashboard/interview/' + interviewData?.mockId + "/feedback"}>
                        <Button>End Interview</Button>
                    </Link>}
            </div>
        </div>
    )
}

export default StartInterview