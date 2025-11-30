"use client";
import { UserCourseListContext } from '@/app/_context/UserCourseListContext';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useContext } from 'react';

const AddCourse = () => {
    const { user } = useUser(); 
    const { userCourseList, setUserCourseList } = useContext(UserCourseListContext);

    return ( 
        <div className="flex justify-between items-center p-6 bg-white rounded-lg">
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    Hello, <span className='font-bold'>{user?.fullName}</span>
                </h2>
                <p className="mb-6">
                    Create new course with AI, share it with your friends and Earn from it.
                </p>
            </div>

            <Link href={userCourseList >= 5 ? '/dashboard/upgrade' : '/create-course'}>
                <Button className="text-white bg-primary">+ Create AI course</Button>
            </Link>
        </div>
    );
}

export default AddCourse;
