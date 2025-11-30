import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useContext } from "react";
import { UserInputContext } from "@/app/_context/UserInpnutContext";


const SelectOptions = () => {

  const {userCourseInput, setUserCourseInput} = useContext(UserInputContext);

  const handleInputChange = (fieldName, value) => {
      setUserCourseInput( prev => ({
        ...prev, 
        [fieldName]:value
      }))
  }

  return (
    <div className="px-10 md:px-20 lg:px-40">
      <div className="grid grid-cols-2 gap-20">

        <div>
            <label className="text-sm">Difficulty Level</label>
            <Select defaultValue={userCourseInput?.level}
             onValueChange={ (value) => handleInputChange('level', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        </div>

         <div>
            <label className="text-sm">Course Duration</label>
            <Select defaultValue={userCourseInput?.duration}
             onValueChange={ (value) => handleInputChange('duration', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1 Hour">1 Hour</SelectItem>
            <SelectItem value="2 Hour">2 Hour</SelectItem>
            <SelectItem value="More than 3 Hour">More than 3 Hour</SelectItem>
          </SelectContent>
        </Select>
        </div>

        <div>
            <label className="text-sm">Add Video</label>
            <Select defaultValue={userCourseInput?.displayVideo}
             onValueChange={ (value) => handleInputChange('displayVideo', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
        </div>

        <div>
            <label className="text-sm">No of Chapters</label>
            <Input type="number" defaultValue={userCourseInput?.noOfChapters} onChange={ (e) => handleInputChange('noOfChapters', e.target.value)}/>
        </div>



        
      </div>
    </div>
  );
};

export default SelectOptions;
