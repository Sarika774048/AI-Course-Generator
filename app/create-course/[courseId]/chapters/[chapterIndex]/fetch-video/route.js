import { NextResponse } from "next/server";
import { db } from "@/configs/db";
// *** NEW: Import the Videos schema and Drizzle functions ***
import { CourseLayout, Videos } from "@/configs/schema"; 
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid'; // Required to generate a UUID for the Videos PK

export async function PUT(req, { params }) {
  const { courseId, chapterIndex } = params;
  // NOTE: The client MUST send 'chapterUniqueId' now for the Videos table to work.
  const { videoUrl, aiContent, chapterUniqueId, chapterTitle } = await req.json(); 

  const index = Number(chapterIndex);
  if (isNaN(index)) return NextResponse.json({ error: "Invalid chapter index" }, { status: 400 });

  try {
    const courseData = await db.select().from(CourseLayout).where({ courseId }).limit(1);
    if (!courseData.length) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const course = courseData[0];
    let chapters = course.courseOutput?.chapters || [];

    if (!chapters[index]) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    // Sanitize videoUrl
    let validVideoUrl = null;
    try {
      const url = new URL(videoUrl);
      const vid = url.searchParams.get("v");
      if (vid) validVideoUrl = `https://www.youtube.com/watch?v=${vid}`;
    } catch (err) { console.warn("Invalid URL format:", videoUrl); }

    // Update JSON structure (preserved)
    chapters[index] = { 
      ...chapters[index], 
      videoUrl: validVideoUrl, 
      aiContent: aiContent || chapters[index].aiContent || null 
    };

    // **********************************************
    // *** NEW LOGIC TO SAVE TO THE 'videos' TABLE ***
    // **********************************************
    if (validVideoUrl && chapterUniqueId) {
        
        // 1. Check if a video record for this chapter already exists in the 'videos' table
        const existingVideo = await db.select().from(Videos).where(eq(Videos.chapterId, chapterUniqueId)).limit(1);

        if (existingVideo.length > 0) {
            // 2. UPDATE existing record
            await db.update(Videos)
                .set({ videoUrl: validVideoUrl, title: chapterTitle || chapters[index].title || chapters[index].chapter_name })
                .where(eq(Videos.chapterId, chapterUniqueId));
            console.log("Updated Videos table record for chapter:", chapterUniqueId);
        } else {
            // 3. INSERT new record
            await db.insert(Videos).values({
                id: uuidv4(), // Generate a new UUID for the videos table PK
                chapterId: chapterUniqueId,
                videoUrl: validVideoUrl,
                title: chapterTitle || chapters[index].title || chapters[index].chapter_name,
            });
            console.log("Inserted new Videos table record for chapter:", chapterUniqueId);
        }
    } else if (!chapterUniqueId) {
        console.warn("Skipped Videos table save: Chapter ID not sent from client.");
    }
    // **********************************************
    // **********************************************


    // Existing Logic: Update the courseOutput JSON column (PRESERVED)
    await db.update(CourseLayout)
      .set({ courseOutput: { ...course.courseOutput, chapters } })
      .where({ courseId });

    return NextResponse.json({ message: "Chapter updated", chapter: chapters[index] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}