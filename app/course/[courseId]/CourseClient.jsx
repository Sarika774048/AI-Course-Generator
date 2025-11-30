// /app/course/[courseId]/CourseClient.jsx 

"use client"

import CourseBasicInfo from "@/app/create-course/[courseId]/_components/CourseBasicInfo"
import Header from "@/app/dashboard/_components/Header"
import { db } from "@/configs/db"
// 👇 1. Import CourseChapter here
import { CourseLayout, CourseChapter } from "@/configs/schema" 
import { eq } from "drizzle-orm"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"; 
import CourseDetails from "@/app/create-course/[courseId]/_components/CourseDetails"
import ChapterList from "@/app/create-course/[courseId]/_components/ChapterList"

export default function CourseClient({courseId}){
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            GetCourse(courseId);
        }
    },[courseId]);
    
    const GetCourse = async (id) => {
        setLoading(true);
        try {
            // 1. Fetch Basic Info
            const result = await db.select().from(CourseLayout)
            .where(eq(CourseLayout.courseId, id)); 
            
            // 👇 2. Fetch Video/AI Content from DB
            const chaptersResult = await db.select().from(CourseChapter)
            .where(eq(CourseChapter.courseId, id));

            if (result.length > 0) {
                const courseData = { ...result[0] };
                
                // Parse JSON if needed
                if (typeof courseData.courseOutput === "string") {
                   courseData.courseOutput = JSON.parse(courseData.courseOutput);
                }
                
                let outputChapters = courseData.courseOutput?.chapters || [];

                // 👇 3. MERGE LOGIC: Attach Video URLs from DB to the Chapter List
                outputChapters.forEach((chapter, index) => {
                    // Find the matching chapter in the DB using the index
                    const dbChapter = chaptersResult.find(c => c.chapterIndex === index);
                    
                    if (dbChapter) {
                        chapter.videoUrl = dbChapter.videoUrl; // <--- This enables the Video Player
                        chapter.aiContent = dbChapter.aiContent;
                    }
                });

                // Save merged data back to object
                courseData.courseOutput.chapters = outputChapters;

                setCourse(courseData);
                console.log("Course Data Fetched (Merged):", courseData);
            } else {
                setCourse(null);
                console.warn("No course found for ID:", id);
            }
        } catch (error) {
            console.error("Error fetching course:", error);
            setCourse(null);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
                <p className="ml-2 text-fuchsia-700">Loading course details...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div>
                <Header/>
                <div className="text-center mt-20 text-gray-600">
                    <h2 className="text-2xl font-bold">Course Not Found</h2>
                    <p>The course ID is invalid or the course does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header/>
            <div className="px-10 p-10 md:px-10 lg:px-44">
                <CourseBasicInfo course={course} edit={false}/> 
                <CourseDetails course={course}/>
                <ChapterList course={course} />
            </div>
        </div>
    )
}