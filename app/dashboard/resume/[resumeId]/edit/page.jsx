"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import dummy from '../../_data/dummy'
import FormSection from '../../_components/FormSection'
import ResumePreview from '../../_components/ResumePreview'
import ResumeHeader from '../../_components/ResumeHeader'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import { useReactToPrint } from 'react-to-print'

const EditResume = () => {
    const { resumeId } = useParams();
    const [resumeInfo, setResumeInfo] = useState();
    
    // 1. Create Ref
    const resumeRef = useRef(null);

    useEffect(() => {
        // Initialize with dummy data first to prevent hydration errors
        setResumeInfo(dummy);
        GetResumeData();
    }, []);

    const GetResumeData = async () => {
        const result = await db.select().from(UserResumes).where(eq(UserResumes.resumeId, resumeId));
        if(result.length > 0) {
            setResumeInfo({ ...dummy, ...result[0] }); 
        }
    }

    // 2. The Print Function (UPDATED for v3+)
    const HandleDownload = useReactToPrint({
        contentRef: resumeRef, // 👈 KEY FIX: Use contentRef instead of content function
        documentTitle: resumeInfo?.firstName ? `${resumeInfo.firstName}_Resume` : "My_Resume",
        pageStyle: `
            @page {
                size: auto;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });

    return (
        <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <div className='p-10 bg-slate-50 min-h-screen'>
                
                {/* Header with Download Button */}
                <ResumeHeader onDownload={HandleDownload} />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                    {/* Form Section */}
                    <div className='print:hidden'>
                        <FormSection resumeId={resumeId} />
                    </div>
                    
                    {/* Preview Section */}
                    <div ref={resumeRef}>
                        <ResumePreview />
                    </div>
                </div>
            </div>
        </ResumeInfoContext.Provider>
    )
}

export default EditResume