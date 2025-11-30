"use client"
import Image from "next/image";
import { BookOpen, Layers, TrendingUp, MoreVertical } from "lucide-react";
import Link from "next/link"
import DropdownOption from "./DropdownOption";
import { CourseLayout } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";

const CourseCard = ({ course, refreshData }) => {
  

  

    const handleOnDelete = async () => {
        const resp = await db.delete(CourseLayout)
        .where(eq(CourseLayout.id, course?.id))
        .returning({id:CourseLayout?.id})

        if(resp){
            refreshData()
        }
    }




  return (
    <div className="shadow-lg rounded-2xl border p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer my-4 bg-white relative">


      <Link href={'/course/'+course?.courseId}>
      <Image
        src={course.courseBanner}
        width={300}
        height={300}
        className="w-full h-[200px] object-cover rounded-xl"
        alt="Course banner"
      />
      </Link>

      <div className="p-3">

        {/* Title Row with Icon at End */}
        <div className="flex justify-between items-center">
          <h2 className="font-extrabold text-lg tracking-wide flex items-center gap-2 text-gray-900">
            <Layers size={18} />
            {course?.name.toUpperCase()}
          </h2>
          <DropdownOption
          handleOnDelete ={() => handleOnDelete()}>
            
            <MoreVertical size={18} className="text-gray-700" /></DropdownOption>
        </div>

        <p className="text-xs text-gray-600 mt-1">
          {course?.courseOutput?.course_name}
        </p>

        <div className="flex justify-between items-center mt-4">
          <h2 className="flex gap-2 items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg font-medium shadow-sm">
            <BookOpen size={16} />
            {course?.courseOutput?.no_of_chapters} Chapters
          </h2>

          <h2 className="flex gap-2 items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg font-medium shadow-sm">
            <TrendingUp size={16} />
            {course?.courseOutput?.level}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
