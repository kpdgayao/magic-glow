import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuizChallenge } from "@/lib/claude";
import { quizResultSchema } from "@/lib/validations";
import { awardXP } from "@/lib/gamification";

// POST with ?action=save — saves result only (no AI)
// POST with ?action=challenge — generates 30-day challenge (calls AI)
// POST without action — saves result + generates challenge
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { result } = quizResultSchema.parse(body);
    const action = req.nextUrl.searchParams.get("action");

    if (action === "save") {
      // Just save the quiz result, no AI call
      await prisma.user.update({
        where: { id: session.userId },
        data: { quizResult: result as "YOLO" | "CHILL" | "PLAN" | "MASTER" },
      });
      await awardXP(session.userId, "COMPLETE_QUIZ");
      return NextResponse.json({ result, challenge: null });
    }

    // Generate challenge (calls AI)
    const challenge = await generateQuizChallenge(session.userId, result);
    return NextResponse.json({ result, challenge });
  } catch (error) {
    console.error("Quiz result error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
