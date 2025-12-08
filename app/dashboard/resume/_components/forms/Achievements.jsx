"use client"
import React, { useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import { useParams } from 'next/navigation'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import { Loader2, Bot } from 'lucide-react'
import { getGeminiResponse } from '@/configs/AiResumeModel'

const Achievements = ({ enableNext }) => {
    const [achievementList, setAchievementList] = useState([]);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        resumeInfo?.achievements?.length > 0 
            ? setAchievementList(resumeInfo.achievements)
            : setAchievementList([])
    }, [])

    const handleChange = (index, event) => {
        const newEntries = achievementList.slice();
        const { name, value } = event.target;
        newEntries[index][name] = value;
        setAchievementList(newEntries);
        setResumeInfo({ ...resumeInfo, achievements: newEntries });
    }

    const AddNewAchievement = () => {
        setAchievementList([...achievementList, { title: '', description: '' }])
    }

    const RemoveAchievement = () => {
        setAchievementList(list => list.slice(0, -1))
        setResumeInfo({ ...resumeInfo, achievements: achievementList.slice(0, -1) });
    }

    // AI to polish a raw achievement
    const AiGenerateAchievement = async (index) => {
        const rawTitle = achievementList[index].title;
        if(!rawTitle) return;

        setAiLoading(true);
        const prompt = `Rewrite this achievement for a resume to make it sound professional and impactful: "${rawTitle}"`;
        try {
            const result = await getGeminiResponse(prompt);
            const newEntries = achievementList.slice();
            newEntries[index]['title'] = result.replace(/"/g, ''); // Remove quotes if AI adds them
            setAchievementList(newEntries);
        } catch(e) { console.error(e) }
        setAiLoading(false);
    }

    const onSave = async () => {
        setLoading(true);
        enableNext(true);
        // NOTE: Ensure your DB Schema has an 'achievements' column
        await db.update(UserResumes).set({ achievements: achievementList })
            .where(eq(UserResumes.resumeId, params.resumeId));
        setLoading(false);
        alert('Achievements Saved!');
    }

    return (
        <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white'>
            <h2 className='font-bold text-lg'>Achievements & Certifications</h2>
            <p className='text-sm text-gray-500'>Add awards, certifications, or key accomplishments</p>
            
            <div>
                {achievementList.map((item, index) => (
                    <div key={index} className='flex gap-2 items-end border p-3 my-5 rounded-lg'>
                        <div className='w-full'>
                            <label className='text-xs'>Achievement / Certification</label>
                            <Input 
                                name="title" 
                                onChange={(e) => handleChange(index, e)} 
                                defaultValue={item?.title} 
                                placeholder="Ex: Certified AWS Solutions Architect..."
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-primary mb-0.5"
                            onClick={()=>AiGenerateAchievement(index)}
                            disabled={aiLoading}
                            title="AI Polish"
                        >
                            {aiLoading ? <Loader2 className='animate-spin h-4 w-4'/> : <Bot className='h-4 w-4'/>}
                        </Button>
                    </div>
                ))}
            </div>

            <div className='flex justify-between'>
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={AddNewAchievement} className="text-primary"> + Add </Button>
                    <Button variant="outline" onClick={RemoveAchievement} className="text-primary"> - Remove </Button>
                </div>
                <Button onClick={onSave} disabled={loading}>
                    {loading ? <Loader2 className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default Achievements