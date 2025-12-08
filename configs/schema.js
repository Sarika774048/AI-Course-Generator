import { pgTable, varchar, text, timestamp, integer, uuid, boolean, json, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"; // Import sql if needed for defaults like now()

// 1. CourseLayout Schema
export const CourseLayout = pgTable('courseList', {
  // *** CORRECTED: Using serial() for auto-incrementing integer ID ***
  id: serial('id').primaryKey(), 
  
  courseId: varchar('courseId').notNull(),
  name: varchar('name').notNull(),
  category: varchar('category').notNull(),
  level: varchar('level').notNull(),
  includeVideo: varchar('includeVideo').notNull().default('Yes'),
  courseOutput: json('courseOutput').notNull(),
  createdBy: varchar('createdBy').notNull(),
  userName: varchar('userName'),
  userProfileImage: varchar('userProfileImage'),
  courseBanner: varchar('courseBanner').default('/study2.jpg'),
  publish: boolean('publish').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});


// 2. Videos Schema (Remains UUID as you had it)
export const Videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(), // Primary Key, default UUID
  chapterId: uuid('chapter_id').notNull(), // Foreign key to link to the chapter 
  title: text('title'), // Chapter title
  videoUrl: text('video_url'), // The YouTube URL
  createdAt: timestamp('created_at').defaultNow(),
});




export const CourseChapter = pgTable('courseChapter', {
    id: uuid('id').primaryKey().defaultRandom(),
    
    // This column links to CourseLayout.courseId via your application logic
    courseId: varchar('courseId').notNull(), 
    
    chapter_name: varchar('chapter_name').notNull(),
    duration: varchar('duration'),
    
    // Fields for AI content and video URL
    aiContent: json('aiContent'), 
    videoUrl: text('video_url'), 
    
    // Field to maintain the order of chapters
    chapterIndex: integer('chapter_index').notNull(), 
    
    createdAt: timestamp('created_at').defaultNow(),
});


// 🆕 NEW TABLE: Track User Payments
export const UserSubscription = pgTable('userSubscription', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  userName: varchar('userName'),
  active: boolean('active').default(false), // true = Pro User
  paymentId: varchar('paymentId'),
  joinDate: timestamp('joinDate').defaultNow(),
  plan: varchar('plan') 
});



// 🆕 Track User Progress & Badges
export const UserCourseProgress = pgTable('userCourseProgress', {
  id: serial('id').primaryKey(),
  userEmail: varchar('userEmail').notNull(),
  courseId: varchar('courseId').notNull(),
  completedChapters: json('completedChapters').default([]), // Stores array of chapter indexes [0, 1, 3]
  courseCompleted: boolean('courseCompleted').default(false), // True if all done
  totalXP: integer('totalXP').default(0),
  lastAccessed: timestamp('lastAccessed').defaultNow(),
});


// schema for resume building

export const UserResumes = pgTable('userResumes', {
    id: serial('id').primaryKey(),
    resumeId: varchar('resumeId').notNull(),
    userEmail: varchar('userEmail').notNull(),
    title: varchar('title').notNull(), // e.g., "Full Stack Resume"
    themeColor: varchar('themeColor').default('#7c3aed'),
    userName: varchar('userName'),
    
    // Structured Data
    firstName: varchar('firstName'),
    lastName: varchar('lastName'),
    jobTitle: varchar('jobTitle'),
    address: varchar('address'),
    phone: varchar('phone'),
    email: varchar('email'),
    summary: text('summary'),
    
    // Arrays stored as JSON
    experience: json('experience').default([]),
    education: json('education').default([]),
    skills: json('skills').default([]),
    
    createdAt: timestamp('created_at').defaultNow(),
});




// Interview Prep

// ... imports ...

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(), // Stores questions as JSON string
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt'),
    mockId: varchar('mockId').notNull()
});

export const UserAnswer = pgTable('userAnswer', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    question: varchar('question').notNull(),
    correctAns: text('correctAns'),
    userAns: text('userAns'),
    feedback: text('feedback'),
    rating: varchar('rating'),
    userEmail: varchar('userEmail'),
    createdAt: varchar('createdAt'),
});


// job portal

// Add to configs/schema.js

export const JobListing = pgTable('jobListing', {
    id: serial('id').primaryKey(),
    positionTitle: varchar('positionTitle').notNull(),
    companyName: varchar('companyName').notNull(),
    location: varchar('location').notNull(), // e.g., "Remote", "New York"
    jobType: varchar('jobType').notNull(), // Full-time, Contract, Internship
    salary: varchar('salary'), // e.g. "$100k - $120k"
    jobDescription: text('jobDescription').notNull(),
    experience: varchar('experience').notNull(), // 0-1 Years, 5+ Years
    applyUrl: varchar('applyUrl'), // Link to apply
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt').notNull(),
});