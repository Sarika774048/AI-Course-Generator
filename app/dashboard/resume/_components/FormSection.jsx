"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Bot } from 'lucide-react'
import PersonalDetail from './forms/PersonalDetail'
import Summary from './forms/Summary'
import Experience from './forms/Experience'
import Education from './forms/Education'
import Projects from './forms/Projects'         // IMPORTED
import Achievements from './forms/Achievements' // IMPORTED
import Skills from './forms/Skills'
import { getGeminiResponse } from '@/configs/AiResumeModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const FormSection = ({ resumeId }) => {
  const [activeFormIndex, setActiveFormIndex] = useState(1);
  const [enableNext, setEnableNext] = useState(true); 
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Added Projects and Achievements to the sequence
  // 1: Personal, 2: Summary, 3: Experience, 4: Education, 5: Projects, 6: Achievements, 7: Skills
  
  const getAiMentorAdvice = async () => {
    setLoadingAi(true);
    const prompt = "I am building a resume. Give me 3 generic but pro tips for making an ATS friendly resume.";
    const result = await getGeminiResponse(prompt);
    setAiAdvice(result);
    setLoadingAi(false);
  }

  return (
    <div className='p-5 shadow-lg rounded-lg border-t-4 border-t-purple-600 bg-white relative'>
        
        {/* Header */}
        <div className='flex justify-between items-center mb-5'>
            <h2 className='text-lg font-bold flex items-center gap-2'>
                Editor 
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-4 text-purple-600 border-purple-200" onClick={getAiMentorAdvice}>
                            <Bot size={16} className="mr-2"/> Ask AI Mentor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Resume AI Mentor</DialogTitle></DialogHeader>
                        <div className='text-sm leading-relaxed whitespace-pre-wrap'>
                            {loadingAi ? "Thinking..." : aiAdvice}
                        </div>
                    </DialogContent>
                </Dialog>
            </h2>
            <div className='flex gap-2'>
                {activeFormIndex > 1 && 
                    <Button size="sm" variant="outline" onClick={()=>setActiveFormIndex(activeFormIndex-1)}>
                        <ArrowLeft/>
                    </Button>
                }
                <Button 
                    className="flex gap-2" size="sm" 
                    disabled={!enableNext} 
                    onClick={()=>setActiveFormIndex(activeFormIndex+1)}
                >
                    Next <ArrowRight/>
                </Button>
            </div>
        </div>

        {/* Dynamic Forms */}
        {activeFormIndex === 1 && <PersonalDetail resumeId={resumeId} enableNext={setEnableNext} />}
        {activeFormIndex === 2 && <Summary resumeId={resumeId} enableNext={setEnableNext} />}
        {activeFormIndex === 3 && <Experience resumeId={resumeId} enableNext={setEnableNext} />}
        {activeFormIndex === 4 && <Education resumeId={resumeId} enableNext={setEnableNext} />}
        
        {/* NEW FORMS ADDED HERE */}
        {activeFormIndex === 5 && <Projects resumeId={resumeId} enableNext={setEnableNext} />}
        {activeFormIndex === 6 && <Achievements resumeId={resumeId} enableNext={setEnableNext} />}
        
        {activeFormIndex === 7 && <Skills resumeId={resumeId} enableNext={setEnableNext} />}
        
        {activeFormIndex === 8 && (
            <div className='text-center mt-10'>
                <h2 className='text-2xl font-bold'>You are done!</h2>
                <p>Check the preview on the right and print it.</p>
                <p className='text-xs text-gray-400 mt-2'>Use the "Download / Print" button at the top of the page.</p>
            </div>
        )}
    </div>
  )
}

export default FormSection