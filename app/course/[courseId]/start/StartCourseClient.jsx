"use client";

import { db } from "@/configs/db";
import { CourseLayout, CourseChapter } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti"; 
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; // 👈 Import Router
import { 
  FaPlayCircle, FaCheckCircle, FaBookOpen, 
  FaCode, FaCopy, FaClock, FaLightbulb, 
  FaGraduationCap, FaCheck, FaShareAlt, 
  FaTrophy, FaStar, FaMedal, FaRegCircle, FaTimes, FaArrowLeft
} from "react-icons/fa";

import CourseChatbot from "./_components/CourseChatbot"; 
import CourseCertificate from "./_components/CourseCertificate";

const StartCourseClient = ({ courseId }) => {
  const { user } = useUser();
  const router = useRouter(); // 👈 Initialize Router
  const [courseData, setCourseData] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const [completedChapters, setCompletedChapters] = useState(new Set());
  const [userXP, setUserXP] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (courseId) GetCourse();
  }, [courseId]);

  const GetCourse = async () => {
    try {
      const layoutResult = await db.select().from(CourseLayout).where(eq(CourseLayout.courseId, courseId));
      const chaptersResult = await db.select().from(CourseChapter).where(eq(CourseChapter.courseId, courseId));

      const fetchedCourse = layoutResult[0];

      if (fetchedCourse) {
        if (typeof fetchedCourse.courseOutput === "string") {
            try { fetchedCourse.courseOutput = JSON.parse(fetchedCourse.courseOutput); } catch (e) {}
        }

        let chapters = fetchedCourse.courseOutput?.chapters || [];
        if (!Array.isArray(chapters)) chapters = fetchedCourse.courseOutput?.course?.chapters || [];

        chapters.forEach((chapter, index) => {
          const dbChapter = chaptersResult.find((c) => c.chapterIndex === index);
          if (dbChapter) {
            chapter.videoUrl = dbChapter.videoUrl;
            chapter.chapterId = dbChapter.id;
            if (typeof dbChapter.aiContent === 'string') {
                try { chapter.aiContent = JSON.parse(dbChapter.aiContent); } catch(e) { chapter.aiContent = {}; }
            } else {
                chapter.aiContent = dbChapter.aiContent || {};
            }
          }
        });

        fetchedCourse.courseOutput.chapters = chapters;
        setCourseData(fetchedCourse);
        if (chapters.length > 0) setSelectedChapter(chapters[0]);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChapterComplete = async () => {
    if (!courseData) return;
    const currentIndex = courseData.courseOutput.chapters.indexOf(selectedChapter);
    
    if (completedChapters.has(currentIndex)) return; 

    const newSet = new Set(completedChapters);
    newSet.add(currentIndex);
    setCompletedChapters(newSet);
    setUserXP(prev => prev + 50);

    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#a855f7', '#fbbf24', '#3b82f6'] });

    try {
        await fetch(`/api/courses/${courseId}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userEmail: user?.primaryEmailAddress?.emailAddress,
                chapterIndex: currentIndex
            })
        });
    } catch(e) { console.error("Progress save failed", e); }

    if (newSet.size === courseData.courseOutput.chapters.length) {
        setTimeout(() => setShowBadge(true), 1500);
    }
  };

  const calculateProgress = () => {
    if (!courseData) return 0;
    const total = courseData.courseOutput.chapters.length;
    const completed = completedChapters.size;
    return Math.round((completed / total) * 100);
  };

  const getReadTime = (text) => {
    const wordsPerMinute = 200;
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;
  if (!courseData) return <div className="p-10 text-center text-red-500">Course not found.</div>;

  const aiContent = selectedChapter?.aiContent || {};
  let description = aiContent.explanation || aiContent.description || selectedChapter?.description || "No notes available.";
  if (Array.isArray(description)) description = description.join("\n\n");
  const codeExamples = aiContent.code_examples || aiContent.code || [];
  const currentChapterIndex = courseData.courseOutput.chapters.indexOf(selectedChapter);
  const isCurrentChapterCompleted = completedChapters.has(currentChapterIndex);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-80 hidden md:flex flex-col bg-white border-r border-gray-200 h-full shadow-lg z-20">
        <div className="bg-purple-900 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-full"><FaGraduationCap size={24} className="text-yellow-400"/></div>
                <div><h3 className="font-bold text-lg">Student</h3><p className="text-xs text-purple-200">Keep learning!</p></div>
            </div>
            <div className="flex justify-between text-xs mb-1 text-purple-200"><span>XP Earned</span><span className="font-bold text-white">{userXP} XP</span></div>
            <div className="w-full bg-purple-800 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(userXP / 2, 100)}%` }}></div></div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <h2 className="font-bold text-md text-gray-800 leading-tight mb-2">{courseData.courseOutput.course_name}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1"><div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div></div>
            <p className="text-xs text-right text-gray-500">{calculateProgress()}% Completed</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {courseData.courseOutput.chapters.map((ch, i) => (
            <div key={i} onClick={() => { setSelectedChapter(ch); setCopied(false); }}
              className={`group flex flex-col gap-1 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${selectedChapter?.name === ch.name ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}`}>
              <div className="flex items-start gap-3">
                  <div className={`mt-1 ${selectedChapter?.name === ch.name ? 'text-purple-600' : 'text-gray-300'}`}>
                     {completedChapters.has(i) ? <FaCheckCircle className="text-green-500" size={20} /> : selectedChapter?.name === ch.name ? <FaPlayCircle size={20} /> : <FaRegCircle size={18} />}
                  </div>
                  <div>
                      <h3 className={`font-semibold text-sm leading-tight ${selectedChapter?.name === ch.name ? 'text-purple-900' : 'text-gray-700'}`}>{ch.name || ch.chapter_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 font-medium"><span className="flex items-center gap-1"><FaClock size={10} /> {ch.duration || "10m"}</span></div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto h-full p-6 md:p-10 scroll-smooth bg-[#f8f9fc]">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Chapter {currentChapterIndex + 1}</span>
                        {isCurrentChapterCompleted && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse"><FaCheckCircle /> Completed</span>}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{selectedChapter?.name || selectedChapter?.chapter_name}</h1>
                </div>
                {/* 🔙 BACK TO DASHBOARD BUTTON */}
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors border px-4 py-2 rounded-lg hover:bg-white"
                >
                    <FaArrowLeft /> Dashboard
                </button>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-200">
                {selectedChapter?.videoUrl ? (
                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(selectedChapter.videoUrl)}`} title="Course Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"/>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-900"><FaPlayCircle className="text-6xl mb-4 opacity-20" /><p className="font-medium text-lg">Video Unavailable</p></div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-purple-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FaBookOpen size={18} /></div><h2 className="text-lg font-bold text-gray-800">Chapter Insights</h2></div>
                            <span className="text-xs font-medium text-purple-900 bg-purple-100 px-3 py-1 rounded-full">{getReadTime(description)}</span>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="prose prose-purple max-w-none text-gray-600 leading-7">
                                <ReactMarkdown components={{
                                    strong: ({node, ...props}) => <span className="font-bold text-purple-900" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                    h1: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
                                }}>{description}</ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {codeExamples.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FaCode size={18} /></div><h2 className="text-lg font-bold text-gray-800">Source Code</h2></div>
                            <div className="p-6 md:p-8 space-y-6">
                                {codeExamples.map((item, index) => {
                                    const cleanCode = item.code.replace(/<\/?precode>/g, '');
                                    return (
                                        <div key={index} className="group">
                                            <div className="flex justify-between items-center bg-[#1e1e1e] rounded-t-xl px-4 py-2 border-b border-[#333]">
                                                <span className="text-gray-400 text-xs font-mono">{item.title || `Snippet ${index + 1}`}</span>
                                                <button onClick={() => handleCopyCode(cleanCode)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"><FaCopy size={12}/> {copied ? 'Copied' : 'Copy'}</button>
                                            </div>
                                            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-5 rounded-b-xl overflow-x-auto text-sm font-mono leading-6 shadow-inner"><code>{cleanCode}</code></pre>
                                            {item.explanation && <div className="mt-3 flex gap-3 items-start p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800"><FaLightbulb className="text-blue-500 mt-1 shrink-0" /><span className="leading-relaxed">{item.explanation}</span></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaGraduationCap className="text-green-600"/> Learning Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2"><span className="text-gray-500">Duration</span><span className="font-semibold text-gray-800">{selectedChapter?.duration || "N/A"}</span></div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2"><span className="text-gray-500">Difficulty</span><span className="font-semibold text-gray-800">{courseData?.courseOutput?.level || "Beginner"}</span></div>
                            <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Read Time</span><span className="font-semibold text-purple-600">{getReadTime(description)}</span></div>
                        </div>
                        <button onClick={handleChapterComplete} disabled={isCurrentChapterCompleted} className={`w-full mt-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 transform active:scale-95 ${isCurrentChapterCompleted ? 'bg-green-100 text-green-700 cursor-default border border-green-200' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}>
                            {isCurrentChapterCompleted ? <><FaCheck /> Completed</> : "Mark as Completed"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <CourseChatbot 
        courseName={courseData?.courseOutput?.course_name} 
        chapterName={selectedChapter?.name || selectedChapter?.chapter_name} 
      />

      {/* 🏆 FIXED BADGE MODAL */}
      {showBadge && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-4xl w-full relative animate-in fade-in zoom-in duration-300 my-10 max-h-[90vh] overflow-y-auto">
                
                {/* Close Button */}
                <button 
                    onClick={() => setShowBadge(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaTrophy className="text-yellow-500 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Congratulations!</h2>
                    <p className="text-gray-600">
                        You have successfully completed the <strong>{courseData.courseOutput.course_name}</strong> course.
                    </p>
                </div>

                {/* 📜 Scrollable Certificate Container */}
                <div className="overflow-x-auto border rounded-xl border-gray-200 mb-6 bg-gray-50 p-2 flex justify-center">
                    {/* Make the Certificate component responsive */}
                    <div className="scale-75 md:scale-90 origin-top"> 
                        <CourseCertificate 
                            courseName={courseData.courseOutput.course_name}
                            userName={user?.fullName || "Student Name"}
                            totalChapters={courseData.courseOutput.chapters.length}
                        />
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    {/* Note: The Download button is inside CourseCertificate, but you can also add a close action here */}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default StartCourseClient;