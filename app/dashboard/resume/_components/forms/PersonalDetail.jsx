"use client"
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import React, { useContext, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const PersonalDetail = ({ resumeId, enableNext }) => {
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [formData, setFormData] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        resumeInfo && setFormData(resumeInfo);
    }, [resumeInfo])

    const handleInputChange = (e) => {
        enableNext(false);
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setResumeInfo({ ...resumeInfo, [name]: value });
    }

    const onSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // We save specific columns AND the full object to personalInfo JSON for flexibility
        await db.update(UserResumes).set({
            firstName: formData.firstName,
            lastName: formData.lastName,
            jobTitle: formData.jobTitle,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            // Save the extra social links into the personalInfo JSON column
            personalInfo: formData 
        }).where(eq(UserResumes.resumeId, resumeId));
        
        setLoading(false);
        enableNext(true);
        alert("Details Saved!");
    }

    return (
        <form onSubmit={onSave} className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white'>
            <h2 className='font-bold text-lg'>Personal Detail</h2>
            <p className='text-sm text-gray-500'>Get started with the basic information</p>

            <div className='grid grid-cols-2 mt-5 gap-3'>
                <div>
                    <label className='text-sm font-semibold'>First Name</label>
                    <Input name="firstName" defaultValue={resumeInfo?.firstName} required onChange={handleInputChange} />
                </div>
                <div>
                    <label className='text-sm font-semibold'>Last Name</label>
                    <Input name="lastName" defaultValue={resumeInfo?.lastName} required onChange={handleInputChange} />
                </div>
                <div className='col-span-2'>
                    <label className='text-sm font-semibold'>Job Title</label>
                    <Input name="jobTitle" defaultValue={resumeInfo?.jobTitle} required onChange={handleInputChange} />
                </div>
                <div className='col-span-2'>
                    <label className='text-sm font-semibold'>Address / Location</label>
                    <Input name="address" defaultValue={resumeInfo?.address} required onChange={handleInputChange} />
                </div>
                <div>
                    <label className='text-sm font-semibold'>Phone</label>
                    <Input name="phone" defaultValue={resumeInfo?.phone} required onChange={handleInputChange} />
                </div>
                <div>
                    <label className='text-sm font-semibold'>Email</label>
                    <Input name="email" defaultValue={resumeInfo?.email} required onChange={handleInputChange} />
                </div>
                
                {/* --- NEW FIELDS --- */}
                <div className='col-span-2'>
                    <label className='text-sm font-semibold'>LinkedIn URL</label>
                    <Input name="linkedin" defaultValue={resumeInfo?.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/..." />
                </div>
                <div>
                    <label className='text-sm font-semibold'>GitHub URL</label>
                    <Input name="github" defaultValue={resumeInfo?.github} onChange={handleInputChange} placeholder="github.com/..." />
                </div>
                <div>
                    <label className='text-sm font-semibold'>Portfolio / Website</label>
                    <Input name="website" defaultValue={resumeInfo?.website} onChange={handleInputChange} placeholder="myportfolio.com" />
                </div>
            </div>
            
            <div className='mt-3 flex justify-end'>
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className='animate-spin'/> : 'Save'}
                </Button>
            </div>
        </form>
    )
}

export default PersonalDetail