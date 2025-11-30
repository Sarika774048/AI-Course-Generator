// app/actions/course-actions.js
"use server"

import { db } from "@/configs/db"; // Adjust path if needed
import { CourseChapter } from "@/configs/schema"; // Adjust path if needed
import { eq, and } from "drizzle-orm";

export async function updateChapterContentAction(courseId, chapterIndex, newChapterData) {
    try {
        // Find the specific chapter by courseId AND chapterIndex
        const [chapterResult] = await db
            .select()
            .from(CourseChapter)
            .where(and(
                eq(CourseChapter.courseId, courseId),
                eq(CourseChapter.chapterIndex, chapterIndex)
            ));
    
        if (!chapterResult) {
            return { error: "Chapter not found with index " + chapterIndex };
        }
        
        let updateFields = {};
        
        if (newChapterData.aiContent) {
            updateFields.aiContent = newChapterData.aiContent;
        }
        
        if (newChapterData.videoUrl) {
            updateFields.videoUrl = newChapterData.videoUrl;
        }

        // Update the specific chapter record
        await db.update(CourseChapter)
            .set(updateFields)
            .where(eq(CourseChapter.id, chapterResult.id)); 
            
        return { success: true };

    } catch (error) {
        console.error("Database Update Error:", error);
        return { error: "Failed to update database" };
    }
}