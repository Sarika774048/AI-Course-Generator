// /app/course/[courseId]/page.jsx
// This file is a Server Component and safely handles the dynamic route parameter.

import CourseClient from "./CourseClient"; 

// The component MUST be an async function
export default async function CoursePage({ params }) {
   
    // FIX: Await the entire 'params' object before accessing its properties.
    // This is the literal fix for the strict error you are encountering.
    const unwrappedParams = await params; 
    
    // Now safely read the courseId from the unwrapped object
    const courseId = unwrappedParams.courseId; 
    
    // Pass ONLY the safe, unwrapped ID string to the Client Component
    return (
        <CourseClient courseId={courseId} />
    );
}