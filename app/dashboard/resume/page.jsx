"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { db } from '@/configs/db'
import { UserResumes } from '@/configs/schema'
import { eq, desc } from 'drizzle-orm'
import { PlusSquare, Loader2, FileText, MoreVertical, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ResumeDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [resumeList, setResumeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  useEffect(() => { user && GetResumes(); }, [user]);

  const GetResumes = async () => {
    const result = await db.select().from(UserResumes)
      .where(eq(UserResumes.userEmail, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(UserResumes.createdAt));
    setResumeList(result);
  }

  const onCreate = async () => {
    setLoading(true);
    const uuid = uuidv4();
    await db.insert(UserResumes).values({
        resumeId: uuid,
        title: 'Untitled Resume',
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        experience: [], education: [], skills: [], projects: [], achievements: []
    });
    setLoading(false);
    router.push('/dashboard/resume/' + uuid + "/edit");
  }

  const handleDelete = async () => {
    if(!resumeToDelete) return;
    
    setLoading(true);
    await db.delete(UserResumes).where(eq(UserResumes.resumeId, resumeToDelete));
    setResumeList(resumeList.filter(r => r.resumeId !== resumeToDelete)); // Optimistic update
    setOpenAlert(false);
    setLoading(false);
    // Optional: await GetResumes(); 
  }

  return (
    <div className='p-10'>
      <h2 className='font-bold text-3xl'>My Resumes</h2>
      <p>Create ATS-friendly resumes with AI assistance.</p>
      
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10'>
        
        {/* CREATE NEW BUTTON */}
        <div 
            className='p-14 py-24 border items-center flex justify-center bg-slate-100 rounded-lg h-[280px] hover:scale-105 transition-all cursor-pointer border-dashed border-2' 
            onClick={onCreate}
        >
            {loading ? <Loader2 className='animate-spin'/> : <PlusSquare size={40}/>}
        </div>

        {/* RESUME LIST */}
        {resumeList.map((resume, index) => (
            <div key={index} className='group hover:scale-105 transition-all'>
                
                {/* Clickable Area to Edit */}
                <div 
                    className='p-6 bg-gradient-to-br from-pink-100 to-purple-200 h-[280px] rounded-t-lg flex items-center justify-center border cursor-pointer'
                    onClick={()=>router.push('/dashboard/resume/'+resume.resumeId+"/edit")}
                >
                    <FileText size={50} className='text-purple-600 group-hover:scale-110 transition-all'/>
                </div>
                
                {/* Footer with Title and Options */}
                <div className='border p-3 rounded-b-lg shadow-sm bg-white flex justify-between items-center'>
                    <h2 className='font-medium text-sm truncate w-[160px]'>{resume.title}</h2>
                    
                    {/* DROPDOWN MENU */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className='hover:bg-gray-100 rounded-full p-1 outline-none'>
                                <MoreVertical size={20} className='text-gray-500'/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem 
                                onClick={()=>router.push('/dashboard/resume/'+resume.resumeId+"/edit")}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-red-600 flex gap-2" 
                                onClick={() => {
                                    setResumeToDelete(resume.resumeId); 
                                    setOpenAlert(true);
                                }}
                            >
                                <Trash size={15} /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        ))}
      </div>

      {/* CONFIRMATION ALERT DIALOG */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your resume.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={()=>setOpenAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {loading ? <Loader2 className='animate-spin'/> : 'Delete'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default ResumeDashboard;