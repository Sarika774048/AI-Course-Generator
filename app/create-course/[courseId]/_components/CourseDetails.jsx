
import { FaChalkboardTeacher, FaClock, FaPlayCircle, FaBookOpen } from "react-icons/fa";


const CourseDetails = ({course}) => {
  return (
    <div className='border p-6 rounded-xl shadow-sm mt-3'>
        <div className='grid grid-cols-2 md:grid-cols-4'>


            <div className="flex gap-2 items-center">
  <FaChalkboardTeacher className="text-4xl text-fuchsia-700"/>
  <div>
    <h2 className="text-xs text-gray-700">Skill Level</h2>
    <h2 className="font-medium text-lg">{course?.level}</h2>
  </div>
</div>

<div className="flex gap-2 items-center">
  <FaClock className="text-4xl text-green-600"/>
  <div>
    <h2 className="text-xs text-gray-700">Duration</h2>
    <h2 className="font-medium text-lg">{course?.courseOutput?.duration}</h2>
  </div>
</div>

<div className="flex gap-2 items-center">
  <FaBookOpen className="text-4xl text-blue-500"/>
  <div>
    <h2 className="text-xs text-gray-700">No of Chapters</h2>
    <h2 className="font-medium text-lg">{course?.courseOutput?.no_of_chapters}</h2>
  </div>
</div>

<div className="flex gap-2 items-center">
  <FaPlayCircle className="text-4xl text-red-500"/>
  <div>
    <h2 className="text-xs text-gray-700">Include Video</h2>
    <h2 className="font-medium text-lg">{course?.includeVideo ? "Yes" : "No"}</h2>
  </div>
</div>



        </div>
    </div>
  )
}

export default CourseDetails