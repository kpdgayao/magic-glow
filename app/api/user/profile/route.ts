import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        incomeSources: true,
        monthlyIncome: true,
        financialGoal: true,
        languagePref: true,
        quizResult: true,
        quizChallenge: true,
        onboarded: true,
        xp: true,
        level: true,
        streakCount: true,
        longestStreak: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = profileUpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        incomeSources: true,
        monthlyIncome: true,
        financialGoal: true,
        languagePref: true,
        quizResult: true,
        onboarded: true,
        xp: true,
        level: true,
        streakCount: true,
        longestStreak: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
