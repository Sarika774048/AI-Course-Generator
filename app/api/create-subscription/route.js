import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { UserSubscription } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { email, userName, paymentId } = await req.json();

    // 1. Check if the user already exists
    const result = await db
      .select()
      .from(UserSubscription)
      .where(eq(UserSubscription.email, email));

    // 2. Insert or Update
    if (result.length > 0) {
      await db
        .update(UserSubscription)
        .set({ active: true, paymentId: paymentId })
        .where(eq(UserSubscription.email, email));
    } else {
      await db.insert(UserSubscription).values({
        email: email,
        userName: userName,
        active: true,
        paymentId: paymentId,
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}