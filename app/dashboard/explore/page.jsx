import { db } from "@/configs/db";
import { CourseLayout } from "@/configs/schema";
import { desc } from "drizzle-orm";
import CourseCard from "../_components/CourseCard";
export default async function ExplorePage() {
  
  // 1. Fetch latest courses (ensure ID is sorted descending)
  const courseList = await db
    .select()
    .from(CourseLayout)
    .limit(9) // Show 9 for a nice 3x3 grid
    .orderBy(desc(CourseLayout.id));

  return (
    <div className="px-6 md:px-12 lg:px-24 py-10 bg-gray-50 min-h-screen">
      
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-extrabold text-3xl text-gray-900">
              Explore Community Courses
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Discover unique AI-generated learning paths created by others.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseList.length > 0 ? (
              courseList.map((course, index) => (
                <CourseCard key={index} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <h3 className="text-xl font-semibold text-gray-700">No courses found yet</h3>
                <p className="text-gray-500 mb-4">Be the first to create an AI course!</p>
                {/* Optional Link to create */}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}