"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text'
import { Mic, StopCircle, Save, Loader2 } from 'lucide-react'
import { InterviewFeedbackAI, feedbackModel, feedbackConfig } from '@/configs/InterviewAiModal'
import { db } from '@/configs/db'
import { UserAnswer } from '@/configs/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { Textarea } from '@/components/ui/textarea'

const RecordAnswerSection = ({ mockInterviewQuestion, activeQuestionIndex, interviewData }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    
    const {
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results.map((result) => (
            setUserAnswer(prevAns => prevAns + result?.transcript)
        ))
    }, [results])

    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    }

    const UpdateUserAnswer = async () => {
        if(userAnswer.length < 5) {
            alert("Answer is too short. Please record or type more.");
            return;
        }

        setLoading(true);

        const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}. Depends on question and user answer for given interview question please give us rating for answer and feedback as area of improvement if any in just 3 to 5 lines to improve it in JSON format with field rating and feedback field.`;

        try {
            // 1. Send Message
            const result = await InterviewFeedbackAI.models.generateContent({
                model: feedbackModel,
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: feedbackPrompt }]
                    }
                ],
                config: feedbackConfig
            });
            
            // 2. Extract Text using Reference Code Logic
            // The reference code uses this specific path to get the text:
            const mockJsonRespRaw = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!mockJsonRespRaw) {
                console.error("Full AI Result:", result);
                throw new Error("Empty response from AI. It might be blocked or network failed.");
            }

            // 3. CLEAN JSON (Robust Method)
            let cleanText = mockJsonRespRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = cleanText.indexOf("{");
            const lastBrace = cleanText.lastIndexOf("}");
            
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanText = cleanText.substring(firstBrace, lastBrace + 1);
            }
            
            // 4. Parse JSON
            const mockJsonResp = JSON.parse(cleanText);
            
            // 5. Save to DB
            const resp = await db.insert(UserAnswer).values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: mockJsonResp?.feedback,
                rating: mockJsonResp?.rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy')
            });

            if (resp) {
                alert('User Answer recorded successfully');
            }
            
        } catch (error) {
            console.error("Error saving answer:", error);
            alert("Error: " + error.message);
        }
        
        setLoading(false);
    }

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt="Webcam placeholder"/>
                <Webcam
                    mirrored={true}
                    style={{
                        height: 300,
                        width: '100%',
                        zIndex: 10,
                    }}
                />
            </div>

            <div className='flex gap-4 mt-10'>
                 <Button 
                    disabled={loading} 
                    variant="outline" 
                    onClick={StartStopRecording}
                >
                    {isRecording ? 
                        <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
                            <StopCircle /> Stop Recording
                        </h2>
                        :
                        <h2 className='text-primary flex gap-2 items-center'>
                            <Mic /> Record Answer
                        </h2>
                    }
                </Button>
            </div>

            <div className='w-full mt-5 max-w-2xl'>
                <label className='text-sm text-gray-500 font-medium mb-2 block'>Your Answer (Type or Edit below):</label>
                <Textarea 
                    className="h-40 focus:border-primary active:border-primary p-4 text-lg"
                    placeholder="Type your answer here or record using the microphone..."
                    value={userAnswer}
                    onChange={(e)=>setUserAnswer(e.target.value)}
                />
            </div>

            <Button 
                className="mt-5 mb-10 bg-primary hover:bg-primary/90" 
                onClick={UpdateUserAnswer}
                disabled={loading}
            >
                {loading ? 
                    <><Loader2 className='animate-spin mr-2'/> Saving...</> 
                    : 
                    <><Save className='mr-2 h-4 w-4'/> Save User Answer</>
                }
            </Button>
        </div>
    )
}

export default RecordAnswerSection