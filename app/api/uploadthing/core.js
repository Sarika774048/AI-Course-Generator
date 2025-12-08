import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  chatAttachment: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    text: { maxFileSize: "4MB", maxFileCount: 1 },
    blob: { maxFileSize: "8MB", maxFileCount: 1 } 
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
    }),
};