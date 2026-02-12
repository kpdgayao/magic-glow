import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateQuizChallenge } from "@/lib/claude";
import { quizResultSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { result } = quizResultSchema.parse(body);

    const challenge = await generateQuizChallenge(session.userId, result);

    return NextResponse.json({ result, challenge });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Quiz result error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
