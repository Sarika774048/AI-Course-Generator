"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useContext, useEffect, useState } from 'react'
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import { useParams } from 'next/navigation'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import { Loader2, Bot, Sparkles } from 'lucide-react'
import { getGeminiResponse } from '@/configs/AiResumeModel' // Import your AI model

const Experience = ({ enableNext }) => {
    const [experienceList, setExperienceList] = useState([]);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false); // Specific loader for AI

    useEffect(() => {
        resumeInfo?.experience.length > 0 && setExperienceList(resumeInfo?.experience)
    }, [])

    const handleChange = (index, event) => {
        const newEntries = experienceList.slice();
        const { name, value } = event.target;
        newEntries[index][name] = value;
        setExperienceList(newEntries);
        setResumeInfo({ ...resumeInfo, experience: newEntries });
    }

    // --- 🤖 AI GENERATION FUNCTION ---
    const GenerateWorkSummary = async (index) => {
        const jobTitle = experienceList[index].title;
        if (!jobTitle) {
            alert("Please enter a Position Title first!");
            return;
        }

        setAiLoading(true);
        // Prompt for ATS friendly HTML list
        const prompt = `Position: ${jobTitle}. Generate 3-4 ATS-friendly, professional resume bullet points focusing on impact and metrics. Format the output as an HTML unordered list (<ul><li>...</li></ul>). Do not include any JSON or other text, just the HTML.`;
        
        try {
            const result = await getGeminiResponse(prompt);
            
            // Clean up the result (sometimes AI adds markdown code blocks)
            const cleanHtml = result.replace(/```html/g, '').replace(/```/g, '');

            const newEntries = experienceList.slice();
            // Append to existing text or replace
            newEntries[index]['workSummary'] = cleanHtml;
            setExperienceList(newEntries);
            setResumeInfo({ ...resumeInfo, experience: newEntries });
        } catch (error) {
            console.error(error);
            alert("AI Failed to generate summary.");
        }
        setAiLoading(false);
    }

    const AddNewExperience = () => {
        setExperienceList([...experienceList, {
            title: '', companyName: '', city: '', state: '', startDate: '', endDate: '', workSummary: '', currentlyWorking: false
        }])
    }

    const RemoveExperience = () => {
        setExperienceList(experienceList => experienceList.slice(0, -1))
        setResumeInfo({ ...resumeInfo, experience: experienceList.slice(0, -1) });
    }

    const onSave = async () => {
        setLoading(true);
        enableNext(true);
        await db.update(UserResumes).set({ experience: experienceList })
            .where(eq(UserResumes.resumeId, params.resumeId));
        setLoading(false);
        alert('Experience Saved!');
    }

    return (
        <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white'>
            <h2 className='font-bold text-lg'>Professional Experience</h2>
            <p className='text-sm text-gray-500'>Add your previous job experience</p>
            <div>
                {experienceList.map((item, index) => (
                    <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div>
                            <label className='text-xs'>Position Title</label>
                            <Input name="title" onChange={(event) => handleChange(index, event)} defaultValue={item?.title} placeholder="Ex: Full Stack Developer" />
                        </div>
                        <div>
                            <label className='text-xs'>Company Name</label>
                            <Input name="companyName" onChange={(event) => handleChange(index, event)} defaultValue={item?.companyName} />
                        </div>
                        <div>
                            <label className='text-xs'>City</label>
                            <Input name="city" onChange={(event) => handleChange(index, event)} defaultValue={item?.city} />
                        </div>
                        <div>
                            <label className='text-xs'>State</label>
                            <Input name="state" onChange={(event) => handleChange(index, event)} defaultValue={item?.state} />
                        </div>
                        <div>
                            <label className='text-xs'>Start Date</label>
                            <Input type="date" name="startDate" onChange={(event) => handleChange(index, event)} defaultValue={item?.startDate} />
                        </div>
                        <div>
                            <label className='text-xs'>End Date</label>
                            <Input type="date" name="endDate" onChange={(event) => handleChange(index, event)} defaultValue={item?.endDate} />
                        </div>
                        
                        {/* WORK SUMMARY WITH AI BUTTON */}
                        <div className='col-span-2'>
                            <div className='flex justify-between items-center mb-2'>
                                <label className='text-xs font-bold'>Work Summary</label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => GenerateWorkSummary(index)}
                                    className="border-primary text-primary flex gap-2 hover:bg-purple-50"
                                >
                                    {aiLoading ? <Loader2 className='animate-spin h-4 w-4'/> : <Sparkles className='h-4 w-4'/>} 
                                    Generate with AI
                                </Button>
                            </div>
                            <textarea 
                                className="w-full border rounded-md p-2 text-sm focus:outline-purple-500" 
                                name="workSummary" 
                                rows="5" 
                                onChange={(event) => handleChange(index, event)} 
                                defaultValue={item?.workSummary} 
                                placeholder="Click 'Generate with AI' or type manually..."
                            ></textarea>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex justify-between'>
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={AddNewExperience} className="text-primary"> + Add More Experience</Button>
                    <Button variant="outline" onClick={RemoveExperience} className="text-primary"> - Remove</Button>
                </div>
                <Button onClick={onSave} disabled={loading}>
                    {loading ? <Loader2 className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default Experience