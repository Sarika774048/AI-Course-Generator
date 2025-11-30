import StartCourseClient from "./StartCourseClient";

export default async function StartCoursePage({ params }) {
  // 1. Unwrap params (Next.js 15 requirement)
  const { courseId } = await params;

  // 2. Pass courseId to the Client Component
  return <StartCourseClient courseId={courseId} />;
}