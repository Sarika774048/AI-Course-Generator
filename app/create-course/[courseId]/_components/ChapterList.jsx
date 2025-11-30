"use client";

import { useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { HiOutlineCheckCircle } from "react-icons/hi";
import EditChapters from "./EditChapters";
import VideoPlayer from "./VideoPlayer";
import fetchYoutubeUrl from "@/utils/youtube"; 

const ChapterList = ({ course, refreshData }) => {
  const [loadingVideo, setLoadingVideo] = useState(null);

  // Safely get chapters (defaults to empty array if missing)
  const chapters = course?.courseOutput?.chapters || [];

  const handleFetchVideo = async (chapterIndex) => {
    const chapter = chapters[chapterIndex]; // Ensure 'chapters' is defined from course.courseOutput.chapters
    if (!chapter) return;

    setLoadingVideo(chapterIndex);

    // 1. DATA PREP
    const chapterName = (chapter.name || chapter.chapter_name || chapter.title || "").trim();
    const courseName = (course?.courseOutput?.course_name || course?.name || "").trim();
    const duration = chapter.duration || "";

    try {
      // 2. FETCH (Compulsory)
      const videoUrl = await fetchYoutubeUrl({
          courseName: courseName,
          chapterName: chapterName,
          duration: duration 
      });

      if (!videoUrl) {
        alert("YouTube search failed. Please try again.");
        setLoadingVideo(null);
        return;
      }

      // 3. SAVE
      await fetch(`/api/courses/${course.courseId}/chapters/${chapterIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.courseId,
          chapterIndex: chapterIndex,
          chapterName: chapterName,
          videoUrl: videoUrl,
          aiContent: chapter.aiContent,
          duration: duration
        }),
      });

      refreshData();
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVideo(null);
    }
  };




  

  return (
    <div className="mt-5">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase mb-5 border-b-4 border-fuchsia-600 inline-block pb-1">
        Chapters
      </h2>

      <div className="mt-2 text-sm text-gray-500 mb-4">
        {chapters.length > 0 ? `${chapters.length} Chapters Available` : "No chapters found."}
      </div>

      <div className="space-y-5">
        {chapters.map((ch, i) => (
          <div key={i} className="relative flex flex-col md:flex-row gap-4 border p-5 rounded-lg items-start bg-white shadow-sm">
            
            {/* Green Check Icon */}
            <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
               <HiOutlineCheckCircle className="text-white text-2xl" />
            </div>

            {/* Chapter Number */}
            <div className="shrink-0">
              <h1 className="font-bold text-md bg-fuchsia-800 h-10 w-10 text-white rounded-full flex items-center justify-center">
                {i + 1}
              </h1>
            </div>

            {/* Chapter Details */}
            <div className="flex flex-col flex-1 w-full">
              <div className="flex justify-between items-center">
                <strong className="text-gray-900 text-lg">
                  {ch.name || ch.chapter_name || ch.title || `Chapter ${i + 1}`}
                </strong>
                <EditChapters course={course} i={i} refreshData={refreshData} />
              </div>

              <div className="flex items-center gap-2 text-fuchsia-600 text-sm mt-1">
                <FaRegClock />
                <span>{ch.duration || "Duration N/A"}</span>
              </div>

              <p className="text-gray-700 mt-2 text-sm">
                {ch.description || ch.about || "No description available."}
              </p>

              {/* Video Player or Fetch Button */}
              <div className="mt-4">
                {ch.videoUrl ? (
                  <VideoPlayer
                    videoUrl={ch.videoUrl}
                    onReplace={() => handleFetchVideo(i)} 
                  />
                ) : (
                  <button
                    onClick={() => handleFetchVideo(i)}
                    disabled={loadingVideo === i}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-all shadow-md flex items-center gap-2"
                  >
                    {loadingVideo === i ? "Searching YouTube..." : "🎥 Fetch Video"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;