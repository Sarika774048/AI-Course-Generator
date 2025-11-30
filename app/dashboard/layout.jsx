"use client"
import { useState } from "react";
import {UserCourseListContext} from "../_context/UserCourseListContext";
import Header from "./_components/Header";
import SideBar from "./_components/SideBar";

const DashboardLayout = ({ children }) => {
  const [userCourseList, setUserCourseList] = useState([]);
  return (
    <UserCourseListContext.Provider value={{userCourseList, setUserCourseList}}>
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden md:block md:w-64">
        <SideBar />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Header />
        <div className="p-10">
          {children}
        </div>
      </div>
    </div>
    </UserCourseListContext.Provider>
  );
};

export default DashboardLayout;
