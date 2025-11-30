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