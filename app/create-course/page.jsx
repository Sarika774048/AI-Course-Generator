"use client";
import { useEffect, useState, useContext } from "react";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { MdTopic } from "react-icons/md";
import { IoMdOptions } from "react-icons/io";
import { Button } from "@/components/ui/button";
import SelectCategory from "./_components/SelectCategory";
import TopicDescription from "./_components/TopicDescription";
import SelectOptions from "./_components/SelectOptions";
import { UserInputContext } from "@/app/_context/UserInpnutContext";
import { GenerateCourseLayout_AI, model, config, contents } from "@/configs/AiModel"; 
import LoadingDialog from "./_components/LoadingDialog";
import { db } from "@/configs/db";
import { CourseLayout } from "@/configs/schema";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const CreateCourse = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { userCourseInput } = useContext(UserInputContext);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const steps = [
    { id: 1, name: "Category", icon: <BiSolidCategoryAlt /> },
    { id: 2, name: "Topic & Description", icon: <MdTopic /> },
    { id: 3, name: "Options", icon: <IoMdOptions /> },
  ];

  const checkStatus = () => {
    if (activeIndex === 0) return !userCourseInput?.category;
    if (activeIndex === 1) return !userCourseInput?.topic;
    if (activeIndex === 2) return !userCourseInput?.level || !userCourseInput?.duration || !userCourseInput?.displayVideo || !userCourseInput?.noOfChapters;
    return false;
  };

  const GenerateCourseLayout = async () => {
    setLoading(true);
    let finalJson = null;

    try {
      const BASIC_PROMPT = "Generate A Course Tutorial with fields: Course Name, Description, Chapters (name, about, duration). Return ONLY valid JSON.";
      const USER_INPUT_PROMPT = `Category: ${userCourseInput.category}, Topic: ${userCourseInput.topic}, Level: ${userCourseInput.level}, Duration: ${userCourseInput.duration}, NoOfChapters: ${userCourseInput.noOfChapters}`;
      const finalPrompt = BASIC_PROMPT + " " + USER_INPUT_PROMPT;

      console.log("Final Prompt: ", finalPrompt);

      // Map prompt into contents structure (from your config)
      const preparedContents = contents.map((content) => {
        if (content.parts[0].text === "INSERT_INPUT_HERE") {
          return { role: "user", parts: [{ text: finalPrompt }] };
        }
        return content;
      });

      // Call Streaming API (Correct for your config structure)
      const response = await GenerateCourseLayout_AI.models.generateContentStream({
        model,
        config,
        contents: preparedContents,
      });

      let fullText = "";
      for await (const chunk of response) {
        if (chunk.text) fullText += chunk.text;
      }

      console.log("RAW AI TEXT:", fullText);

      // Clean JSON
      let cleanText = fullText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBrace = cleanText.indexOf("{");
      const lastBrace = cleanText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      finalJson = JSON.parse(cleanText);
      console.log("FINAL JSON:", finalJson);

    } catch (error) {
      console.error("Error generating layout:", error);
      setLoading(false);
    }

    if (finalJson) {
      await SaveCourseLayoutInDb({ courseLayout: finalJson });
    } else {
      setLoading(false);
    }
  };

  const SaveCourseLayoutInDb = async ({ courseLayout }) => {
    const id = uuid4();
    try {
      await db.insert(CourseLayout).values({
        courseId: id,
        name: userCourseInput?.topic,
        level: userCourseInput?.level,
        category: userCourseInput?.category,
        courseOutput: courseLayout,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        userProfileImage: user?.imageUrl,
      });
      router.replace(`/create-course/${id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-100 flex justify-center items-start py-20">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-4xl p-10">
        <h2 className="text-4xl text-fuchsia-800 font-semibold text-center mb-6">Create Course</h2>
        
        {/* Stepper */}
        <div className="flex justify-center items-center mb-10">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className={`p-5 rounded-full text-3xl shadow-md ${activeIndex === index ? "bg-fuchsia-700 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step.icon}
              </div>
              {index !== steps.length - 1 && <div className={`h-1 w-24 rounded-full ${index < activeIndex ? "bg-fuchsia-700" : "bg-gray-300"}`}></div>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-10 md:px-20 mt-10">
          {activeIndex === 0 ? <SelectCategory /> : activeIndex === 1 ? <TopicDescription /> : <SelectOptions />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button variant="outline" disabled={activeIndex === 0} onClick={() => setActiveIndex(activeIndex - 1)}>Previous</Button>
          {activeIndex < 2 && <Button onClick={() => setActiveIndex(activeIndex + 1)} disabled={checkStatus()}>Next</Button>}
          {activeIndex === 2 && <Button onClick={GenerateCourseLayout} disabled={checkStatus() || loading} className="bg-fuchsia-800 text-white">Generate Course Layout</Button>}
        </div>
      </div>
      <LoadingDialog loading={loading} />
    </div>
  );
};

export default CreateCourse;