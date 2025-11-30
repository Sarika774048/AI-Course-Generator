import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/configs/db";
import { CourseLayout } from "@/configs/schema";
import clsx from "clsx";
import { useEffect, useState } from "react";

import { FaEdit } from "react-icons/fa";
import { eq } from "drizzle-orm";

const EditCourseBasicInfo = ({course, refreshData}) => {

  const [name, setName] = useState();
  const [description, setDescription] = useState();

  useEffect(() => {
    setName(course.courseOutput.course_name);
    setDescription(course.courseOutput.description);
  },[course])

  const onUpdateHandler = async () => {
    course.courseOutput.course_name = name;
    course.courseOutput.description = description;
    const result = await db.update(CourseLayout).set({
      courseOutput:course?.courseOutput
    }).where(eq(CourseLayout?.id, course?.id))
    .returning({id:CourseLayout.id});

    refreshData(true);

    console.log(result);
  }


  return (
    <Dialog>
  <DialogTrigger><FaEdit /></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Course Title & Description</DialogTitle>
      <DialogDescription>
        <div className="mt-3">
          <label>Course Title</label>
          <Input defaultValue={course?.courseOutput?.course_name}
          onChange={(e) => setName(e.target.value) }/>
        </div>
        <div>
          <label>Description</label>
          <Textarea className="h-40" defaultValue={course?.courseOutput?.description} onChange={(e) => setDescription(e.target.value)}/>
        </div>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>
        <Button onClick={onUpdateHandler}>Update</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default EditCourseBasicInfo