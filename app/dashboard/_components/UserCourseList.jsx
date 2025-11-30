"use client"

import { useUser } from "@clerk/nextjs"
import { useContext, useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import { UserCourseListContext } from "@/app/_context/UserCourseListContext"

// ❌ REMOVE THESE IMPORTS (This fixes the error)
// import { db } from "@/configs/db"
// import { CourseLayout } from "@/configs/schema"
// import { eq } from "drizzle-orm"

const UserCourseList = () => {

    const [courseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Safety check: Ensure context exists before destructuring
    const { setUserCourseList } = useContext(UserCourseListContext) || {}; 
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            getUserCourses();
        }
    }, [user]);

    const getUserCourses = async () => {
        setLoading(true);
        try {
            // ✅ FETCH from the API instead of using db.select() directly
            const response = await fetch(`/api/courses/user?userEmail=${user?.primaryEmailAddress?.emailAddress}`);
            const data = await response.json();
            
            console.log("User Courses:", data);
            setCourseList(data);
            
            // Only set context if it exists
            if (setUserCourseList) {
                setUserCourseList(data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-10">
            <h2 className="font-medium text-xl mb-4">My Courses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Show Data if Loaded */}
                {!loading && courseList?.length > 0 ? (
                    courseList.map((course, index) => (
                        <CourseCard 
                            course={course} 
                            key={index} 
                            refreshData={() => getUserCourses()}
                        />
                    ))
                ) : loading ? (
                    // 2. Show Skeletons while Loading
                    [1, 2, 3, 4, 5].map((item, i) => (
                        <div key={i} className="w-full bg-slate-200 animate-pulse rounded-lg h-[270px]"></div>
                    ))
                ) : (
                    // 3. Show Empty State
                    <div className="col-span-full text-gray-500 mt-5">
                        No courses found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserCourseList;