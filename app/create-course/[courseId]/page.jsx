"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
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
  const router = useRouter(); // Initialize Router
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
        // Safe JSON Parse
        if (typeof courseData.courseOutput === "string") {
            try { courseData.courseOutput = JSON.parse(courseData.courseOutput); } catch(e){}
        }
        if (typeof courseData.chapters === "string") {
            try { courseData.chapters = JSON.parse(courseData.chapters); } catch(e){}
        }

        let outputChapters = courseData.courseOutput?.chapters || [];

        // Merge DB Data (Video/AI Content) to show status
        outputChapters.forEach((chapter, index) => {
          const dbChapter = chaptersResult.find((c) => c.chapterIndex === index);
          if (dbChapter) {
            chapter.videoUrl = dbChapter.videoUrl;
            chapter.aiContent = dbChapter.aiContent;
            chapter.id = dbChapter.id; 
          }
        });

        courseData.courseOutput.chapters = outputChapters;
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
        
        const PROMPT = `
          You are a JSON-only generator AI.
          Rules: Return ONLY valid JSON. No markdown.
          Structure: {
            "title": "${chapter.chapter_name}",
            "explanation": "Detailed tutorial content...",
            "code_examples": [{"title": "Example Code", "code": "console.log('hello');"}]
          }
          Topic: ${course?.courseOutput?.course_name}
          Chapter: ${chapter?.chapter_name}
        `;
        
        console.log(`Generating content for chapter ${i + 1}...`);

        let parsedContent = null;
        try {
          // 1. Call AI
          const aiResponse = await GenerateChapterContent_AI.models.generateContent({
            model: "models/gemini-flash-latest",
            contents: [{ role: "user", parts: [{ text: PROMPT }] }],
            responseMimeType: "application/json",
            generationConfig: { temperature: 0.4 },
          });

          // 🛠️ FIX: Clean Markdown before parsing (Prevents SyntaxError)
          const rawText = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const cleanText = rawText.replace(/```json|```/gi, '').trim();
          parsedContent = JSON.parse(cleanText);

        } catch (err) {
          console.error(`❌ AI Error for chapter ${i + 1}`, err);
        }

        // 2. 🎥 VIDEO FETCH (Compulsory)
        let videoUrl = "";
        if (course?.includeVideo === 'Yes') {
            try {
                // Construct robust query object
                videoUrl = await fetchYoutubeUrl({
                    courseName: course.courseOutput?.course_name,
                    chapterName: chapter.chapter_name,
                    duration: chapter.duration
                });
            } catch (vidErr) {
                console.warn("Video fetch warning:", vidErr);
            }
        }

        // 3. Update Local State
        updatedChapters[i] = { 
            ...chapter, 
            aiContent: parsedContent,
            videoUrl: videoUrl 
        };

        // 4. Save to Database
        await fetch(`/api/courses/${courseId}/chapters/${i}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: courseId,
            chapterIndex: i,
            chapterName: chapter.title || chapter.chapter_name,
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

      <ChapterList 
        course={course} 
        refreshData={() => fetchCourse()} 
      />

      <Button onClick={GenerateChapterContent} className="my-10 w-full" disabled={loading}>
        {loading ? "Generating Content..." : "Generate Course Content"}
      </Button>
    </div>
  );
};

export default Courselayout;