import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseLayout } from "@/configs/schema";

export async function PUT(req, { params }) {
  const { courseId, chapterIndex } = params;
  const { videoUrl, aiContent } = await req.json();

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

    chapters[index] = { 
      ...chapters[index], 
      videoUrl: validVideoUrl, 
      aiContent: aiContent || chapters[index].aiContent || null 
    };

    await db.update(CourseLayout)
      .set({ courseOutput: { ...course.courseOutput, chapters } })
      .where({ courseId });

    return NextResponse.json({ message: "Chapter updated", chapter: chapters[index] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
