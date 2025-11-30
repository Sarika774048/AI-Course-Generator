import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseChapter } from "@/configs/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req, { params }) {
  try {
    // Await params (Next.js 15 Fix)
    const resolvedParams = await params;
    const { courseId, chapterId } = resolvedParams;
    
    // Convert 'chapterId' (which is actually the index 0,1,2) to integer
    const chapterIndex = parseInt(chapterId); 

    const body = await req.json();
    const { videoUrl, aiContent, chapterName } = body;

    // Check if chapter exists
    const existing = await db.select().from(CourseChapter).where(
        and(eq(CourseChapter.courseId, courseId), eq(CourseChapter.chapterIndex, chapterIndex))
    );

    if (existing.length > 0) {
        // Update
        await db.update(CourseChapter).set({
            videoUrl, 
            aiContent, 
            chapter_name: chapterName
        }).where(and(eq(CourseChapter.courseId, courseId), eq(CourseChapter.chapterIndex, chapterIndex)));
    } else {
        // Insert
        await db.insert(CourseChapter).values({
            courseId, 
            chapterIndex, 
            chapter_name: chapterName, 
            videoUrl, 
            aiContent
        });
    }

    return NextResponse.json({ message: "Saved" });
  } catch (e) {
    console.error("DB Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}