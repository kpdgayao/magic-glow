import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateGlowScore } from "@/lib/gamification";
import { computeBadges } from "@/lib/badges";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const [user, glowScore, badges] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id },
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
          employmentStatus: true,
          hasEmergencyFund: true,
          debtSituation: true,
          isAdmin: true,
          onboarded: true,
          streakCount: true,
          lastCheckIn: true,
          longestStreak: true,
          xp: true,
          level: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              incomeEntries: true,
              expenses: true,
              monthlyBudgets: true,
              chatMessages: true,
              dailyAdvice: true,
            },
          },
        },
      }),
      calculateGlowScore(id),
      computeBadges(id),
    ]);

    return NextResponse.json({ user, glowScore, badges });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (error.name === "NotFoundError") return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Admin user detail error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
