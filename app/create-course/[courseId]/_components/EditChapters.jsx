// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { db } from "@/configs/db";
// import { CourseLayout } from "@/configs/schema";
// import { eq } from "drizzle-orm";
// import { useEffect, useState } from "react";




// import { HiPencilSquare } from "react-icons/hi2";

// const EditChapters = ({course, i, refreshData}) => {

//     const Chapters = course?.courseOutput?.chapters;

//     const [name, setName] = useState();
//     const [about, setAbout] = useState();

//     useEffect(() => {
//         setName(Chapters[i].chapter_name);
//         setAbout(Chapters[i].about);
//     }, [course])

//     const onUpdateHandler = async () => {
//         course.courseOutput.chapters[i].chapter_name = name;
//         course.courseOutput.chapters[i].about=about;
//         const result = await db.update(CourseLayout).set({
//         courseOutput:course?.courseOutput
//     }).where(eq(CourseLayout?.id, course?.id))
//     .returning({id:CourseLayout.id});

//     refreshData(true);
//     console.log(result);

//     }

    
    
//   return (
//     <Dialog>
//   <DialogTrigger><HiPencilSquare /></DialogTrigger>
//   <DialogContent>
//     <DialogHeader>
//       <DialogTitle>Edit Chapter</DialogTitle>
//       <DialogDescription>
//          <div className="mt-3">
//           <label>Course Title</label>
//           <Input defaultValue={Chapters[i].chapter_name}
//           onChange={(e) => setName(e.target.value) }/>
//         </div>
//         <div>
//           <label>Description</label>
//           <Textarea className="h-40" defaultValue={Chapters[i].about} onChange={(e) => setAbout(e.target.value)}/>
//         </div>
//       </DialogDescription>
//     </DialogHeader>
//     <DialogFooter>
//         <DialogClose>
//             <Button onClick={onUpdateHandler}>Update</Button>
//         </DialogClose>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>
//   )
// }

// export default EditChapters


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
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { HiPencilSquare } from "react-icons/hi2";

const EditChapters = ({ course, i, refreshData }) => {
  const Chapters = course?.courseOutput?.chapters;

  const [name, setName] = useState();
  const [about, setAbout] = useState();

  useEffect(() => {
    // Check if Chapters and specific index exist before setting state
    if (Chapters && Chapters[i]) {
      setName(Chapters[i].chapter_name);
      setAbout(Chapters[i].about);
    }
  }, [course, i, Chapters]); // Added dependencies for safety

  const onUpdateHandler = async () => {
    // Create a deep copy of the course output to avoid mutating props directly
    const courseOutput = course?.courseOutput;
    courseOutput.chapters[i].chapter_name = name;
    courseOutput.chapters[i].about = about;

    const result = await db
      .update(CourseLayout)
      .set({
        courseOutput: courseOutput,
      })
      .where(eq(CourseLayout?.id, course?.id))
      .returning({ id: CourseLayout.id });

    refreshData(true);
    console.log(result);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <HiPencilSquare />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
          <DialogDescription>
            Edit the details of your chapter below.
          </DialogDescription>
        </DialogHeader>

        {/* --- FIX: MOVED INPUTS OUTSIDE DIALOG DESCRIPTION --- */}
        <div className="mt-3">
          <label>Course Title</label>
          <Input
            defaultValue={Chapters?.[i]?.chapter_name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <label>Description</label>
          <Textarea
            className="h-40"
            defaultValue={Chapters?.[i]?.about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
        {/* ---------------------------------------------------- */}

        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onUpdateHandler}>Update</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChapters;