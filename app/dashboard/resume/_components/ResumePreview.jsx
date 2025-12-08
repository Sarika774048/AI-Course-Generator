"use client"
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import React, { useContext } from 'react'

const ResumePreview = () => {
    const { resumeInfo } = useContext(ResumeInfoContext)

    return (
        <>
            {/* GLOBAL PRINT STYLES FOR MULTI-PAGE SUPPORT */}
            <style>{`
                @media print {
                    @page {
                        margin: 0mm; 
                        size: auto;
                    }
                    html, body {
                        height: auto !important;
                        overflow: visible !important;
                        position: relative !important;
                    }
                    /* Ensures background colors and borders print correctly */
                    .resume-container {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div 
                // CONTAINER CLASSES:
                // 1. resume-container: for the print CSS selector
                // 2. h-auto & min-h-[280mm]: Grows with content, looks like A4 on screen
                // 3. print:overflow-visible: Allows content to flow to next page
                className={`resume-container shadow-2xl h-auto min-h-[280mm] w-full bg-white border-t-[20px] p-14 font-sans text-gray-800
                           print:shadow-none print:m-0 print:w-full print:h-auto print:overflow-visible print:p-[40px]`}
                style={{ borderColor: resumeInfo?.themeColor }}
            >
                {/* --- HEADER --- */}
                <div className='text-center break-inside-avoid'>
                    <h2 className='font-bold text-5xl mb-2' style={{ color: resumeInfo?.themeColor }}>
                        {resumeInfo?.firstName} {resumeInfo?.lastName}
                    </h2>
                    <h2 className='text-center text-lg font-medium tracking-widest uppercase mb-4'>
                        {resumeInfo?.jobTitle}
                    </h2>
                    <div className='flex justify-center items-center gap-3 text-xs text-gray-600 border-b pb-4 mb-4' style={{borderColor: resumeInfo?.themeColor}}>
                        <span>{resumeInfo?.address}</span>
                        {resumeInfo?.address && <span>|</span>}
                        <span>{resumeInfo?.email}</span>
                        {resumeInfo?.email && <span>|</span>}
                        <span>{resumeInfo?.phone}</span>
                    </div>

                    {/* Social Links */}
                    <div className='flex justify-center gap-6 text-xs font-medium mb-6'>
                        {resumeInfo?.linkedin && (
                            <span className='flex items-center gap-1'>
                                <span className="font-bold text-gray-400">LI:</span> 
                                <a href={resumeInfo?.linkedin} target="_blank" rel="noreferrer" style={{color: resumeInfo?.themeColor}}>{resumeInfo?.linkedin.replace(/^https?:\/\//, '')}</a>
                            </span>
                        )}
                        {resumeInfo?.github && (
                            <span className='flex items-center gap-1'>
                                <span className="font-bold text-gray-400">GH:</span> 
                                <a href={resumeInfo?.github} target="_blank" rel="noreferrer" style={{color: resumeInfo?.themeColor}}>{resumeInfo?.github.replace(/^https?:\/\//, '')}</a>
                            </span>
                        )}
                        {resumeInfo?.website && (
                            <span className='flex items-center gap-1'>
                                <span className="font-bold text-gray-400">WEB:</span> 
                                <a href={resumeInfo?.website} target="_blank" rel="noreferrer" style={{color: resumeInfo?.themeColor}}>{resumeInfo?.website.replace(/^https?:\/\//, '')}</a>
                            </span>
                        )}
                    </div>
                </div>

                {/* --- SUMMARY --- */}
                <div className='mb-6 break-inside-avoid'>
                    <p className='text-xs leading-5 text-justify'>{resumeInfo?.summary}</p>
                </div>

                {/* --- EXPERIENCE --- */}
                {resumeInfo?.experience?.length > 0 && (
                    <div className='mb-6'>
                        <h2 className='font-bold text-sm mb-2 uppercase' style={{ color: resumeInfo?.themeColor }}>Professional Experience</h2>
                        <hr className='mb-3 border-gray-300' />
                        <div className='flex flex-col gap-4'>
                            {resumeInfo?.experience?.map((exp, index) => (
                                // break-inside-avoid prevents a single job from being cut in half
                                <div key={index} className='break-inside-avoid'>
                                    <h3 className='font-bold text-sm'>{exp.title}</h3>
                                    <div className='flex justify-between text-xs text-gray-600 mb-2 italic'>
                                        <span>{exp.companyName}, {exp.city}, {exp.state}</span>
                                        <span>{exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                                    </div>
                                    <div className='text-xs leading-5 resume-bullet-points' dangerouslySetInnerHTML={{__html: exp.workSummary}} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- EDUCATION --- */}
                {resumeInfo?.education?.length > 0 && (
                    <div className='mb-6'>
                        <div className='break-inside-avoid'>
                            <h2 className='font-bold text-sm mb-2 uppercase' style={{ color: resumeInfo?.themeColor }}>Education</h2>
                            <hr className='mb-3 border-gray-300' />
                        </div>
                        <div className='flex flex-col gap-3'>
                            {resumeInfo?.education?.map((edu, index) => (
                                <div key={index} className='break-inside-avoid'>
                                    <h3 className='font-bold text-sm' style={{color:resumeInfo?.themeColor}}>{edu.universityName}</h3>
                                    <div className='flex justify-between text-xs text-gray-600'>
                                        <span>{edu.degree} in {edu.major}</span>
                                        <span>{edu.startDate} - {edu.endDate}</span>
                                    </div>
                                    <p className='text-xs mt-1'>{edu.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- PROJECTS --- */}
                {resumeInfo?.projects?.length > 0 && (
                    <div className='mb-6'>
                        <div className='break-inside-avoid'>
                             <h2 className='font-bold text-sm mb-2 uppercase' style={{ color: resumeInfo?.themeColor }}>Projects</h2>
                             <hr className='mb-3 border-gray-300' />
                        </div>
                        <div className='flex flex-col gap-3'>
                            {resumeInfo?.projects?.map((project, index) => (
                                <div key={index} className='break-inside-avoid'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='font-bold text-sm'>{project.title}</h3>
                                        {project.link && (
                                            <a href={project.link} target="_blank" className='text-[10px] text-blue-600 underline'>
                                                Link
                                            </a>
                                        )}
                                    </div>
                                    <p className='text-xs text-gray-500 italic mb-1'>{project.technologies}</p>
                                    <div className='text-xs leading-5 resume-bullet-points' dangerouslySetInnerHTML={{__html: project.summary}} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ACHIEVEMENTS --- */}
                {resumeInfo?.achievements?.length > 0 && (
                    <div className='mb-6 break-inside-avoid'>
                        <h2 className='font-bold text-sm mb-2 uppercase' style={{ color: resumeInfo?.themeColor }}>Achievements</h2>
                        <hr className='mb-3 border-gray-300' />
                        <ul className='list-disc list-outside ml-4 flex flex-col gap-1'>
                            {resumeInfo?.achievements?.map((ach, index) => (
                                <li key={index} className='text-xs leading-5'>
                                    {ach.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* --- SKILLS --- */}
                {resumeInfo?.skills?.length > 0 && (
                    <div className='mb-6 break-inside-avoid'>
                        <h2 className='font-bold text-sm mb-2 uppercase' style={{ color: resumeInfo?.themeColor }}>Skills</h2>
                        <hr className='mb-3 border-gray-300' />
                        <div className='flex flex-wrap gap-2'>
                            {resumeInfo?.skills?.map((skill, index) => (
                                <span key={index} className='text-xs px-2 py-1 bg-gray-100 rounded border font-medium print:bg-white print:border-gray-300'>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default ResumePreview