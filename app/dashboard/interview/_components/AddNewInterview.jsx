"use client"
import React, { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { db } from '@/configs/db'
import { MockInterview } from '@/configs/schema'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { getGeminiResponse } from '@/configs/AiResumeModel'

const AddNewInterview = () => {
    const [openDialog, setOpenDialog] = useState(false)
    const [jobPosition, setJobPosition] = useState();
    const [jobDesc, setJobDesc] = useState();
    const [jobExperience, setJobExperience] = useState();
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const router = useRouter();

    const onSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        
        const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Based on this information, give me 5 interview questions with answers in JSON format. Give "question" and "answer" fields in JSON.`

        try {
            const result = await getGeminiResponse(InputPrompt);
            const MockJsonResp = result.replace(/```json/g,'').replace(/```/g,'');
            
            if(MockJsonResp) {
                const resp = await db.insert(MockInterview).values({
                    mockId: uuidv4(),
                    jsonMockResp: MockJsonResp,
                    jobPosition: jobPosition,
                    jobDesc: jobDesc,
                    jobExperience: jobExperience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                }).returning({mockId: MockInterview.mockId});

                if(resp) {
                    setOpenDialog(false);
                    router.push('/dashboard/interview/' + resp[0]?.mockId);
                }
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    return (
        <div>
            <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all' onClick={() => setOpenDialog(true)}>
                <h2 className='font-bold text-lg text-center'>+ Add New</h2>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
                        <DialogDescription>
                            Add details about your job position/role, job description and years of experience
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* MOVED FORM OUTSIDE OF DialogDescription/Header */}
                    <form onSubmit={onSubmit}>
                        <div className='mt-7 my-3'>
                            <label>Job Role/Job Position</label>
                            <Input placeholder="Ex. Full Stack Developer" required onChange={(e)=>setJobPosition(e.target.value)} />
                        </div>
                        <div className=' my-3'>
                            <label>Job Description / Tech Stack</label>
                            <Textarea placeholder="Ex. React, Angular, NodeJs, MySql etc" required onChange={(e)=>setJobDesc(e.target.value)} />
                        </div>
                        <div className=' my-3'>
                            <label>Years of experience</label>
                            <Input placeholder="Ex. 5" type="number" max="50" required onChange={(e)=>setJobExperience(e.target.value)} />
                        </div>
                        <div className='flex gap-5 justify-end'>
                            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <><Loader2 className='animate-spin'/> Generating from AI</> : 'Start Interview'}
                            </Button>
                        </div>
                    </form>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview;