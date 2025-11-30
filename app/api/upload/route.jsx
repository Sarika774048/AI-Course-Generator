import { v2 as cloudinary } from "cloudinary";
import { db } from "@/configs/db";
import { CourseLayout } from "@/configs/schema";
import { eq } from "drizzle-orm";

// Import your AI config
import { GenerateChapterContent_AI, configChapter, modelChapter } from "@/configs/AiModel";

export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fileBlob = formData.get("file");
    const courseId = formData.get("courseId");
    const chapterPrompt = formData.get("chapterPrompt"); // New: AI prompt

    if (!courseId) {
      return new Response(JSON.stringify({ error: "Missing courseId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let imageUrl = null;
    if (fileBlob instanceof Blob) {
      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "course-images" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      imageUrl = result.secure_url;
    }

    // Fetch course from DB
    const courseRecord = await db
      .select()
      .from(CourseLayout)
      .where(eq(CourseLayout.courseId, courseId))
      .limit(1);

    if (!courseRecord[0]) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const currentCourse = courseRecord[0];

    // Update bannerUrl if image uploaded
    let updatedCourseOutput = { ...currentCourse.courseOutput };
    if (imageUrl) updatedCourseOutput.bannerUrl = imageUrl;

    // Generate AI chapter if prompt provided
    let aiChapter = null;
    if (chapterPrompt) {
      const response = await GenerateChapterContent_AI.models.generateContent({
        model: modelChapter,
        config: configChapter,
        contents: [
          {
            role: "user",
            parts: [{ text: chapterPrompt }],
          },
        ],
      });

      aiChapter = response?.result?.[0]?.content?.[0]?.text || null;
      if (aiChapter) updatedCourseOutput.chapters = [
        ...(currentCourse.courseOutput?.chapters || []),
        aiChapter,
      ];
    }

    // Update DB
    await db
      .update(CourseLayout)
      .set({ courseOutput: updatedCourseOutput })
      .where(eq(CourseLayout.courseId, courseId));

    return new Response(
      JSON.stringify({ url: imageUrl, aiChapter }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Upload / AI Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
