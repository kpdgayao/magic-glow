import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDailyAdvice } from "@/lib/claude";
import { awardXP, updateStreak } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await requireAuth();

    // Get today's date (UTC, date only)
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    // Check for existing advice today
    const existing = await prisma.dailyAdvice.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ advice: existing.content, cached: true });
    }

    // Generate new advice
    const content = await generateDailyAdvice(session.userId);

    // Store it
    await prisma.dailyAdvice.create({
      data: {
        userId: session.userId,
        content,
        date: today,
      },
    });

    // Award XP and update streak
    await awardXP(session.userId, "GET_DAILY_ADVICE");
    await updateStreak(session.userId);

    return NextResponse.json({ advice: content, cached: false });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Advice error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
