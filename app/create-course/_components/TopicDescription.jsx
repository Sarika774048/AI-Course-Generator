import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { UserInputContext } from "@/app/_context/UserInpnutContext";
import { useContext } from "react";


const TopicDescription = () => {

  const {userCourseInput, setUserCourseInput} = useContext(UserInputContext);

  const handleInputChange = (fieldName, value) => {
      setUserCourseInput( prev => ({
        ...prev, 
        [fieldName]:value
      }))
  }

  return (
    <div>
        {/* Topic */}
        <div className="mt-5">
            <label>
                Write a topic for which you want to generate a course
            </label>
           <Input placeholder={'Topic'}
           defaultValue={userCourseInput?.topic}
           onChange={(e) => handleInputChange('topic', e.target.value)}/>
        </div>
        


        {/* Text area */}
        <div className="mt-5">
            <label>Tell us more about your course, what to you want to include in the course</label>
              <Textarea placeholder="About your course"
              defaultValue={userCourseInput?.description} onChange={(e) => handleInputChange('description', e.target.value)} />
        </div>
      

        
    </div>
  )
}

export default TopicDescription