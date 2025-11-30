import AddCourse from './_components/AddCourse'
import UserCourseList from './_components/UserCourseList'


const Dashboard = () => {
  return (
    <div>
        {/* <UserButton /> */}
        <AddCourse />
        {/* Display all the course */}
        <UserCourseList/>
        
    </div>
  )
}

export default Dashboard