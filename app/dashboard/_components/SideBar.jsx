"use client";

import Image from "next/image";
import Link from "next/link";

import {
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { MdTravelExplore } from "react-icons/md";
import { FaUsers, FaFileAlt, FaBriefcase } from "react-icons/fa"; // 👈 Added FaFileAlt for Resume
import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useContext } from "react";
import { UserCourseListContext } from "@/app/_context/UserCourseListContext";
import { FaLaptopCode } from "react-icons/fa";



const Sidebar = () => {
  const Menu = [
    {
      id: 1,
      name: "Home",
      icon: <IoHomeOutline />,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Explore",
      icon: <MdTravelExplore />,
      path: "/dashboard/explore",
    },
    {
      id: 3,
      name: "Upgrade",
      icon: <IoShieldCheckmarkOutline />,
      path: "/dashboard/upgrade",
    },
    {
      id: 4,
      name: "Community",
      icon: <FaUsers />, 
      path: "/dashboard/community",
    },
    {
      id: 5,
      name: "Resume Builder", // Renamed for clarity
      icon: <FaFileAlt />,    // 👈 Changed Icon to look like a document
      path: "/dashboard/resume", // 👈 FIXED: Changed path to point to Resume Dashboard
    },
    {
    id: 6, // Update IDs accordingly
    name: "Interview Prep",
    icon: <FaLaptopCode />, // Import FaLaptopCode from react-icons/fa
    path: "/dashboard/interview",
    },
    {
    id: 7, // Update IDs accordingly
    name: "Jobs",
    icon: <FaBriefcase />, // Import FaLaptopCode from react-icons/fa
    path: "/dashboard/jobs",
    },
    {
      id: 8,
      name: "Logout",
      icon: <IoLogOutOutline />,
      path: "/dashboard/logout",
    },
  ];

  const { userCourseList, setUserCourseList } = useContext(
    UserCourseListContext
  );

  const path = usePathname();

  return (
    <div className="fixed h-full md:w-64 p-5 shadow-md bg-white z-50">
      <div className="flex items-center text-gray-950 font-bold text-3xl">
        <Image
          className="w-12 h-12 rounded-full"
          src={"/actual.webp"}
          width={50}
          height={50}
          alt="logo"
        />
      </div>

      <hr className="my-5" />

      <ul className="flex flex-col gap-2">
        {Menu.map((m) => (
          <li key={m.id}>
            <Link
              href={m.path}
              className={`flex items-center gap-2 text-gray-800 p-3 cursor-pointer rounded-lg hover:bg-gray-300 hover:text-black transition-all ${
                path === m.path ? "bg-gray-300 text-black" : ""
              }`}
            >
              <div className="text-2xl">{m.icon}</div>
              <h2>{m.name}</h2>
            </Link>
          </li>
        ))}
      </ul>

      <div className="absolute bottom-10 w-[80%]">
        <Progress value={(userCourseList?.length / 5) * 100} />
        <h2 className="text-sm my-2">
          {userCourseList?.length} out of 5 Course created
        </h2>
        <h2 className="text-xs text-gray-700">
          Upgrade your plan for unlimited course generation
        </h2>
      </div>
    </div>
  );
};

export default Sidebar;