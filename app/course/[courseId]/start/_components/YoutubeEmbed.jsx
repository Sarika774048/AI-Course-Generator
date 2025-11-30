"use client";

import { db } from "@/configs/db";
import { CourseLayout, Videos } from "@/configs/schema"; 
import { eq, and } from "drizzle-orm"; 
import { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";

const StartCourseClient = ({ courseId }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null); 

  useEffect(() => {
    if (courseId) {
      GetCourse(courseId);
    }
  }, [courseId]);

  const GetCourse = async (id) => {
    setLoading(true);
    try {
      const courseLayoutResult = await db
        .select()
        .from(CourseLayout)
        .where(eq(CourseLayout.courseId, id));
      
      const fetchedCourseData = courseLayoutResult[0] || null;

      if (fetchedCourseData) {
          // *** KEEPING THE PARSING FIXES, THEY ARE CRITICAL ***
          if (typeof fetchedCourseData.courseOutput === 'string') {
               fetchedCourseData.courseOutput = JSON.parse(fetchedCourseData.courseOutput);
          }
          
          let chapters = fetchedCourseData.courseOutput?.chapters || [];

          chapters = chapters.map(ch => {
              if (typeof ch.aiContent === 'string') {
                  try {
                      return { ...ch, aiContent: JSON.parse(ch.aiContent) };
                  } catch (e) {
                      console.error("Failed to parse aiContent JSON for chapter:", ch.chapter_name);
                  }
              }
              return ch;
          });
          
          fetchedCourseData.courseOutput.chapters = chapters;
          // *** END FIXES ***

          setCourseData(fetchedCourseData);
          if (chapters.length > 0) {
              setSelectedChapter(chapters[0]); // Select first chapter on load
          }
      } else {
           setCourseData(null);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setCourseData(null);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!courseData) {
    return <div className="text-center mt-20 text-red-500">Course not found.</div>;
  }

  const courseOutput = courseData.courseOutput;
  // This is the key object that contains 'title', 'description', and 'code_examples'
  const chapterContent = selectedChapter?.aiContent; 
  const videoUrl = selectedChapter?.videoUrl; 


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      
      {/* Sidebar (Chapter List) */}
      <div className="md:w-72 hidden md:block h-screen shadow-lg p-6 fixed left-0 top-0 overflow-y-auto border-r border-gray-200">
        <h2 className="text-[22px] font-extrabold text-white bg-purple-700 w-[calc(100%+24px)] -ml-6 p-3 ">
            {courseOutput?.course_name || 'Course Name'}
        </h2>
        <div className="h-[3px] w-16 bg-fuchsia-600 rounded mb-6"></div>
        <div className="space-y-2">
          {/* Ensure chapters array is present before mapping */}
          {courseOutput?.chapters?.map((ch, i) => (
            <div key={i} 
               className={`pb-2 border-b border-gray-300 hover:bg-fuchsia-50 transition-all rounded-md cursor-pointer 
               ${
                 selectedChapter?.chapter_name === ch.chapter_name ? 'bg-purple-400 text-white shadow-md' : ''
               }`}
               onClick={() => setSelectedChapter(ch)}
            >
              <ChapterListCard ch={ch} i={i} />
            </div>
          ))}
          {/* Fallback if no chapters loaded */}
          {(!courseOutput?.chapters || courseOutput.chapters.length === 0) && (
              <p className="text-red-500 text-sm">No chapters found to display.</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 p-10">
        
        {/* Fallback when no chapter is selected */}
        {!selectedChapter && <h1 className="text-2xl text-gray-500">Select a chapter to begin.</h1>}
        
        {selectedChapter && (
            <div>
                {/* 1. Chapter Title (Guaranteed H1) */}
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                    {chapterContent?.title || selectedChapter.chapter_name || 'NO CHAPTER TITLE FOUND'}
                </h1>

                {/* 2. Video Placeholder / Summary (Guaranteed Box) */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow border border-dashed border-purple-400">
                    <h2 className="text-2xl font-bold text-fuchsia-700 mb-3">Chapter Summary & Video Placeholder</h2>
                    {/* Placeholder content for video space */}
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
                        {videoUrl ? `Video Player Placeholder: ${videoUrl}` : 'Video Not Attached Placeholder'}
                    </div>
                    <p className="text-gray-700">Duration: <span className="font-semibold">{selectedChapter.duration || 'N/A'}</span></p>
                </div>

                {/* 3. AI Content Description (Video Notes) (Guaranteed Box) */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow border border-dashed border-purple-400">
                    <h2 className="text-2xl font-bold text-fuchsia-700 mb-3">Video Notes / Detailed Content</h2>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {/* Print content if available, otherwise print fallback text */}
                        {chapterContent?.description || selectedChapter.description || 
                         "***Placeholder: No detailed notes provided in the AI output (aiContent.description is empty).***"}
                    </p>
                </div>

                {/* 4. Code Examples Section (Guaranteed Heading/Container) */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow border border-dashed border-purple-400">
                    <h2 className="text-2xl font-bold text-fuchsia-700 mb-4 border-b pb-2">Code Examples</h2>
                    
                    {/* Check if we have code examples */}
                    {chapterContent?.code_examples?.length > 0 ? (
                        chapterContent.code_examples.map((example, index) => (
                            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg shadow border">
                                <h3 className="text-xl font-semibold mb-2">{example.title}</h3>
                                <p className="text-gray-600 mb-3">{example.explanation}</p>
                                
                                {/* Simple Pre-formatted Code Block (instead of SyntaxHighlighter) */}
                                <div className="rounded-lg overflow-hidden bg-gray-800 text-white p-4">
                                    <pre className="whitespace-pre-wrap text-sm">
                                        {example.code?.replace(/<precode>|<\/precode>/g, '') || '// No code provided'}
                                    </pre>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Fallback when no code examples are found
                        <p className="text-gray-600">***Placeholder: No code examples found in the AI output.***</p>
                    )}
                </div>
                
            </div>
        )}
      </div>
    </div>
  );
};

export default StartCourseClient;