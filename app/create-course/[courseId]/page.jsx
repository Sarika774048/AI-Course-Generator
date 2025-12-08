


"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/configs/db";
import { CourseLayout, CourseChapter } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";

import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetails from "./_components/CourseDetails";
import ChapterList from "./_components/ChapterList"; 
import { Button } from "@/components/ui/button";
import fetchYoutubeUrl from "@/utils/youtube"; 
import { GenerateChapterContent_AI } from "@/configs/AiModel";

const Courselayout = () => {
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const courseId = pathname?.split("/").pop();

  useEffect(() => {
    if (courseId && user) fetchCourse();
  }, [courseId, user]);

  const fetchCourse = async () => {
    try {
      const result = await db.select().from(CourseLayout)
        .where(and(eq(CourseLayout.courseId, courseId), eq(CourseLayout.createdBy, user?.primaryEmailAddress?.emailAddress)));
      
      const chaptersResult = await db.select().from(CourseChapter).where(eq(CourseChapter.courseId, courseId));

      if (result.length > 0) {
        const courseData = { ...result[0] };
        
        // Robust JSON Parsing
        let parsedOutput = courseData.courseOutput;
        if (typeof parsedOutput === "string") {
            try { parsedOutput = JSON.parse(parsedOutput); } catch(e){}
        }

        // Handle different AI structures
        let chapters = [];
        if (Array.isArray(parsedOutput?.chapters)) chapters = parsedOutput.chapters;
        else if (Array.isArray(parsedOutput?.course?.chapters)) chapters = parsedOutput.course.chapters;
        
        // Merge DB Data
        const mergedChapters = chapters.map((chapter, index) => {
          const dbChapter = chaptersResult.find((c) => c.chapterIndex === index);
          return {
            ...chapter,
            videoUrl: dbChapter?.videoUrl || "",
            aiContent: dbChapter?.aiContent || null,
            name: chapter.name || chapter.chapter_name || `Chapter ${index + 1}`
          };
        });

        courseData.courseOutput = { ...parsedOutput, chapters: mergedChapters };
        setCourse(courseData);
      } else {
        setCourse(null);
      }
    } catch (err) {
      console.error(err);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  // 🕒 HELPER: Sleep function to prevent 503 Rate Limits
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ===========================
  // 🔥 Generate AI Content + Video + Save + Redirect
  // ===========================
  const GenerateChapterContent = async () => {
    if (!course) return;
    setLoading(true);

    try {
      const chapters = course?.courseOutput?.chapters || [];
      const updatedChapters = [...chapters];

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        // 🛑 PAUSE: Wait 1.5 seconds before processing to keep AI happy
        await sleep(1500);

        console.log(`Generating content for chapter ${i + 1}...`);

        const PROMPT = `
          You are a JSON-only generator AI.
          Rules:
          1. Return ONLY valid JSON. No markdown.
          2. Escape special characters like quotes inside strings.
          Structure:
          {
            "title": "${chapter.name}",
            "explanation": "Detailed tutorial content in 2-3 paragraphs...",
            "code_examples": [{"title": "Example Code", "code": "console.log('hello world');"}]
          }
          Topic: ${course?.courseOutput?.course_name}
          Chapter: ${chapter.name}
        `;

        let parsedContent = null;
        
        // 🔄 RETRY BLOCK: Handles 503 Service Unavailable
        try {
            // Attempt 1
            const aiResponse = await GenerateChapterContent_AI.models.generateContent({
                model: "models/gemini-flash-latest",
                contents: [{ role: "user", parts: [{ text: PROMPT }] }],
                responseMimeType: "application/json",
            });
            const text = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            parsedContent = JSON.parse(text.replace(/```json|```/gi, '').trim());
        } catch (err) {
            console.warn(`⚠️ Error on Chapter ${i+1}. Retrying in 3s...`);
            await sleep(3000); // Wait longer
            
            try {
                // Attempt 2 (Retry)
                const retryResp = await GenerateChapterContent_AI.models.generateContent({
                    model: "models/gemini-flash-latest",
                    contents: [{ role: "user", parts: [{ text: PROMPT }] }],
                });
                const text = retryResp?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                parsedContent = JSON.parse(text.replace(/```json|```/gi, '').trim());
            } catch (fatalErr) {
                console.error("❌ Failed after retry:", fatalErr);
                // Fallback content
                parsedContent = {
                    title: chapter.name,
                    explanation: "Content could not be generated at this time.",
                    code_examples: []
                };
            }
        }

        // 2. 🎥 VIDEO FETCH
        let videoUrl = "";
        if (course?.includeVideo === 'Yes') {
            try {
                videoUrl = await fetchYoutubeUrl({
                    courseName: course.courseOutput?.course_name,
                    chapterName: chapter.name,
                    duration: chapter.duration
                });
            } catch (vidErr) {
                console.warn("Video fetch warning:", vidErr);
            }
        }

        // 3. Update Local & DB
        updatedChapters[i] = { ...chapter, aiContent: parsedContent, videoUrl: videoUrl };

        await fetch(`/api/courses/${courseId}/chapters/${i}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: courseId,
            chapterIndex: i,
            chapterName: chapter.name || chapter.title,
            aiContent: parsedContent,
            videoUrl: videoUrl,
          }),
        });
      }

      setCourse((prev) => ({
        ...prev,
        courseOutput: { ...(prev?.courseOutput || {}), chapters: updatedChapters },
      }));

      // 5. ✅ REDIRECT TO START PAGE
      console.log("All chapters generated. Redirecting...");
      router.replace(`/course/${courseId}/start`);

    } catch (err) {
      console.error("🚨 Unexpected Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!course) return <p className="text-center mt-10">Course not found.</p>;

  return (
    <div className="mt-10 px-7 md:px-20 lg:px-44">
      <h2 className="font-bold text-center text-2xl mb-6">Course Layout</h2>
      <CourseBasicInfo course={course} refreshData={() => fetchCourse()} />
      <CourseDetails course={course} />
      <ChapterList course={course} refreshData={() => fetchCourse()} />

      <Button onClick={GenerateChapterContent} className="my-10 w-full" disabled={loading}>
        {loading ? "Generating Content..." : "Generate Course Content"}
      </Button>
    </div>
  );
};

export default Courselayout;