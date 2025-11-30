"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaBookOpen } from "react-icons/fa";
import EditCourseBasicInfo from "./EditCourseBasicInfo";
import { useState } from "react";
import Link from "next/link";

const CourseBasicInfo = ({ course, refreshData, edit=true}) => {
  if (!course) return null;

  const [selectedFile, setSelectedFile] = useState();
  const [uploadedUrl, setUploadedUrl] = useState(course.courseOutput?.bannerUrl);
  const [isUploading, setIsUploading] = useState(false); // optional uploading indicator

  /**
   * Handles file selection and uploads to Cloudinary
   */
  const onFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(previewUrl);
    setUploadedUrl(previewUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", course.courseId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        // Replace preview with final Cloudinary URL
        setUploadedUrl(data.url);
        refreshData(); // refresh DB data so future refresh shows the new image
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 border rounded-xl shadow-lg mt-5 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Section */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-3xl text-gray-900">
              {course.courseOutput?.course_name}
             { edit && <EditCourseBasicInfo course={course} refreshData={refreshData} />}
            </h2>
            <p className="text-md text-gray-600 mt-4">{course.courseOutput?.description}</p>

            <div className="flex items-center mt-4">
              <FaBookOpen className="text-indigo-500 mr-2" size={20} />
              <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                {course.category}
              </span>
            </div>
          </div>


          {!edit && <Link href={'/course/'+course?.courseId+'/start'}>
           <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white">
            Start
          </Button></Link>}
         
        </div>

        {/* Banner Image */}
        <div>
          <label htmlFor="upload-image" className="relative cursor-pointer">
            <Image
              src={uploadedUrl || selectedFile || "/study2.jpg"}
              alt="banner"
              width={400}
              height={300}
              className="w-full rounded-xl h-[300px] object-cover shadow-md"
              key={uploadedUrl || selectedFile} // forces reload when URL changes
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-bold">
                Uploading...
              </div>
            )}
          </label>
          <input
            type="file"
            id="upload-image"
            className="opacity-0 absolute w-0 h-0"
            onChange={onFileSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
