"use client"
import React, { useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ResumeInfoContext } from '@/app/_context/ResumeInfoContext'
import { useParams } from 'next/navigation'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import { Loader2, Sparkles } from 'lucide-react'
import { getGeminiResponse } from '@/configs/AiResumeModel'

const Projects = ({ enableNext }) => {
    const [projectList, setProjectList] = useState([]);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        // Initialize with existing data or one empty form
        resumeInfo?.projects?.length > 0 
            ? setProjectList(resumeInfo.projects) 
            : setProjectList([])
    }, [])

    const handleChange = (index, event) => {
        const newEntries = projectList.slice();
        const { name, value } = event.target;
        newEntries[index][name] = value;
        setProjectList(newEntries);
        setResumeInfo({ ...resumeInfo, projects: newEntries });
    }

    const GenerateProjectSummary = async (index) => {
        const project = projectList[index];
        if (!project.title) {
            alert("Please enter a Project Title first!");
            return;
        }

        setAiLoading(true);
        const prompt = `Project Title: ${project.title}, Technologies used: ${project.technologies}. Generate a concise, impressive resume project description (3-4 bullet points) in HTML format (<ul><li>...</li></ul>). Highlight challenges solved and technologies used.`;
        
        try {
            const result = await getGeminiResponse(prompt);
            const cleanHtml = result.replace(/```html/g, '').replace(/```/g, '');
            
            const newEntries = projectList.slice();
            newEntries[index]['summary'] = cleanHtml;
            setProjectList(newEntries);
            setResumeInfo({ ...resumeInfo, projects: newEntries });
        } catch (error) {
            console.error(error);
            alert("AI Failed to generate summary.");
        }
        setAiLoading(false);
    }

    const AddNewProject = () => {
        setProjectList([...projectList, {
            title: '', 
            technologies: '', 
            link: '', 
            summary: ''
        }])
    }

    const RemoveProject = () => {
        setProjectList(projectList => projectList.slice(0, -1))
        setResumeInfo({ ...resumeInfo, projects: projectList.slice(0, -1) });
    }

    const onSave = async () => {
        setLoading(true);
        enableNext(true);
        // NOTE: Ensure your DB Schema has a 'projects' column (json/jsonb type)
        await db.update(UserResumes).set({ projects: projectList })
            .where(eq(UserResumes.resumeId, params.resumeId));
        setLoading(false);
        alert('Projects Saved!');
    }

    return (
        <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 bg-white'>
            <h2 className='font-bold text-lg'>Projects</h2>
            <p className='text-sm text-gray-500'>Showcase your technical projects</p>
            
            <div>
                {projectList.map((item, index) => (
                    <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div className='col-span-2'>
                            <label className='text-xs'>Project Title</label>
                            <Input name="title" onChange={(e) => handleChange(index, e)} defaultValue={item?.title} placeholder="Ex: E-commerce Platform" />
                        </div>
                        <div className='col-span-2'>
                            <label className='text-xs'>Technologies Used</label>
                            <Input name="technologies" onChange={(e) => handleChange(index, e)} defaultValue={item?.technologies} placeholder="React, Node.js, MongoDB..." />
                        </div>
                        <div className='col-span-2'>
                            <label className='text-xs'>Project Link (GitHub/Demo)</label>
                            <Input name="link" onChange={(e) => handleChange(index, e)} defaultValue={item?.link} placeholder="https://github.com/..." />
                        </div>
                        
                        <div className='col-span-2'>
                            <div className='flex justify-between items-center mb-2'>
                                <label className='text-xs font-bold'>Description</label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => GenerateProjectSummary(index)}
                                    className="border-primary text-primary flex gap-2"
                                >
                                    {aiLoading ? <Loader2 className='animate-spin h-4 w-4'/> : <Sparkles className='h-4 w-4'/>} 
                                    Generate with AI
                                </Button>
                            </div>
                            <Textarea 
                                className="w-full" 
                                name="summary" 
                                rows="4" 
                                onChange={(e) => handleChange(index, e)} 
                                defaultValue={item?.summary} 
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex justify-between'>
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={AddNewProject} className="text-primary"> + Add Project </Button>
                    <Button variant="outline" onClick={RemoveProject} className="text-primary"> - Remove </Button>
                </div>
                <Button onClick={onSave} disabled={loading}>
                    {loading ? <Loader2 className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default Projects