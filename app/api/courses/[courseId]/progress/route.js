import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { UserCourseProgress } from "@/configs/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req, { params }) {
  try {
    const { courseId } = await params;
    const { userEmail, chapterIndex } = await req.json();

    // 1. Check if record exists
    const existingProgress = await db.select().from(UserCourseProgress)
      .where(and(eq(UserCourseProgress.courseId, courseId), eq(UserCourseProgress.userEmail, userEmail)));

    if (existingProgress.length > 0) {
      // 2. Update Existing
      const currentChapters = existingProgress[0].completedChapters || [];
      
      // Avoid duplicates
      if (!currentChapters.includes(chapterIndex)) {
        const updatedChapters = [...currentChapters, chapterIndex];
        
        await db.update(UserCourseProgress)
          .set({ 
            completedChapters: updatedChapters,
            totalXP: existingProgress[0].totalXP + 50, // Add 50 XP
            lastAccessed: new Date()
          })
          .where(eq(UserCourseProgress.id, existingProgress[0].id));
      }
      
      return NextResponse.json({ message: "Progress Updated" });
    } else {
      // 3. Create New Record
      await db.insert(UserCourseProgress).values({
        courseId,
        userEmail,
        completedChapters: [chapterIndex],
        totalXP: 50
      });
      return NextResponse.json({ message: "Progress Created" });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}