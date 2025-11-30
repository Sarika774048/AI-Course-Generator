import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

const LoadingDialog = ({ loading }) => {
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent>
        <AlertDialogHeader>
          
          {/* required for accessibility */}
          <AlertDialogTitle className="sr-only">Loading</AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="flex flex-col items-center py-0">
              <Image 
                src="/rocket.gif" 
                alt="Loading..." 
                width={100} 
                height={100} 
                unoptimized 
              />
              <h2>Please wait... AI working on your course creation.</h2>
            </div>
          </AlertDialogDescription>

        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadingDialog;
