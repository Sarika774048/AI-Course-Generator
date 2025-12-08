"use client"
import { Input } from '@/components/ui/input'
import React, { useContext, useEffect, useState } from 'react'
import { Rating } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'
import { Button } from '@/components/ui/button'
import { Loader2, Bot } from 'lucide-react'
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import { useParams } from 'next/navigation'
import { getGeminiResponse } from '@/configs/AiResumeModel'

const Skills = ({ enableNext }) => {
    const [skillsList, setSkillsList] = useState([{ name: '', rating: 0 }]);
    const { resumeId } = useParams();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);

    useEffect(() => {
        resumeInfo?.skills.length > 0 && setSkillsList(resumeInfo?.skills)
    }, [])

    const handleChange = (index, name, value) => {
        const newEntries = skillsList.slice();
        newEntries[index][name] = value;
        setSkillsList(newEntries);
        setResumeInfo({ ...resumeInfo, skills: newEntries });
    }

    const AddNewSkill = () => {
        setSkillsList([...skillsList, { name: '', rating: 0 }])
    }

    const RemoveSkill = () => {
        setSkillsList(skillsList => skillsList.slice(0, -1))
    }

    // --- 🤖 AI SKILL SUGGESTION ---
    const AiSuggestSkills = async () => {
        if (!resumeInfo?.jobTitle) {
            alert("Please complete Personal Details first (Job Title is missing)");
            return;
        }

        setAiLoading(true);
        const prompt = `Job Title: ${resumeInfo.jobTitle}. Return a list of the top 5 technical skills for this role. Return ONLY the skills separated by commas (e.g. React, Node.js, Python). Do not add numbers or bullet points.`;
        
        try {
            const result = await getGeminiResponse(prompt);
            const suggestedSkills = result.split(',').map(skill => ({
                name: skill.trim(),
                rating: 80 // Default rating
            }));

            // Append to existing list
            const updatedList = [...skillsList, ...suggestedSkills];
            
            // Remove empty initial entries if any
            const cleanedList = updatedList.filter(s => s.name !== '');
            
            setSkillsList(cleanedList);
            setResumeInfo({ ...resumeInfo, skills: cleanedList });
        } catch (e) {
            console.error(e);
            alert("AI Failed to get skills");
        }
        setAiLoading(false);
    }

    const onSave = async () => {
        setLoading(true);
        enableNext(true);
        await db.update(UserResumes).set({ skills: skillsList })
            .where(eq(UserResumes.resumeId, resumeId));
        setLoading(false);
        alert('Skills Saved!');
    }

    return (
        <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='font-bold text-lg'>Skills</h2>
                    <p className='text-sm text-gray-500'>Add your top professional skills</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={AiSuggestSkills} 
                    className="border-primary text-primary flex gap-2"
                    disabled={aiLoading}
                >
                    {aiLoading ? <Loader2 className='animate-spin h-4 w-4'/> : <Bot className='h-4 w-4'/>} 
                    AI Suggest
                </Button>
            </div>

            <div className='mt-5'>
                {skillsList.map((item, index) => (
                    <div key={index} className='flex justify-between mb-2 border rounded-lg p-3 items-center'>
                        <div className='w-full mr-2'>
                            <label className='text-xs'>Name</label>
                            <Input className="w-full" onChange={(e) => handleChange(index, 'name', e.target.value)} defaultValue={item.name} />
                        </div>
                        <div className='mt-3'>
                            <Rating style={{ maxWidth: 120 }} value={item.rating} onChange={(v) => handleChange(index, 'rating', v)} />
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex justify-between mt-3'>
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={AddNewSkill} className="text-primary"> + Add </Button>
                    <Button variant="outline" onClick={RemoveSkill} className="text-primary"> - Remove </Button>
                </div>
                <Button onClick={onSave} disabled={loading}>
                    {loading ? <Loader2 className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default Skills