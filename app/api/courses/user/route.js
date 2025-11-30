import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseLayout } from "@/configs/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail');

  if (!userEmail) {
      return NextResponse.json({ error: "User Email is required" }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(CourseLayout)
      .where(eq(CourseLayout.createdBy, userEmail))
      .orderBy(desc(CourseLayout.id)); // Optional: Sort by newest

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}