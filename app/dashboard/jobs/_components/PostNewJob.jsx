"use client"
import React, { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus } from 'lucide-react'
import { db } from '@/configs/db'
import { JobListing } from '@/configs/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { toast } from 'sonner'

const PostNewJob = ({ refreshData }) => {
    const [openDialog, setOpenDialog] = useState(false)
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    
    // Form States
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("Full-Time");
    const [desc, setDesc] = useState("");
    const [experience, setExperience] = useState("");
    const [salary, setSalary] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const resp = await db.insert(JobListing).values({
                positionTitle: title,
                companyName: company,
                location: location,
                jobType: type,
                jobDescription: desc,
                experience: experience,
                salary: salary,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy')
            });

            if(resp) {
                toast.success("Job Posted Successfully!");
                setOpenDialog(false);
                refreshData(); // Refresh list after adding
                // Reset form
                setTitle(""); setCompany(""); setLocation(""); setDesc("");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to post job");
        }
        setLoading(false);
    }

    return (
        <div>
            <div 
                onClick={() => setOpenDialog(true)}
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center gap-2'
            >
                <Plus className='h-10 w-10 text-primary'/>
                <h2 className='font-bold text-lg text-center'>Post A Job</h2>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl overflow-y-scroll max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Post a New Job Opportunity</DialogTitle>
                        <DialogDescription>
                            Share job details with the community.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={onSubmit} className='mt-5'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            <div>
                                <label className='text-sm font-medium'>Job Title</label>
                                <Input placeholder="Ex. Frontend Developer" required onChange={(e)=>setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Company Name</label>
                                <Input placeholder="Ex. Google, Startup Inc" required onChange={(e)=>setCompany(e.target.value)} />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-3'>
                            <div>
                                <label className='text-sm font-medium'>Location</label>
                                <Input placeholder="Ex. Remote, New York" required onChange={(e)=>setLocation(e.target.value)} />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Job Type</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    onChange={(e)=>setType(e.target.value)}
                                >
                                    <option>Full-Time</option>
                                    <option>Part-Time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-3'>
                            <div>
                                <label className='text-sm font-medium'>Salary Range (Optional)</label>
                                <Input placeholder="Ex. $80k - $100k" onChange={(e)=>setSalary(e.target.value)} />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Years of Experience</label>
                                <Input placeholder="Ex. 2-4 Years" required onChange={(e)=>setExperience(e.target.value)} />
                            </div>
                        </div>

                        <div className='mt-3'>
                            <label className='text-sm font-medium'>Job Description</label>
                            <Textarea className="h-32" placeholder="Describe the role and responsibilities..." required onChange={(e)=>setDesc(e.target.value)} />
                        </div>

                        <div className='flex gap-5 justify-end mt-5'>
                            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className='animate-spin'/> : 'Post Job'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PostNewJob