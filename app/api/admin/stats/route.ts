import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      onboardedUsers,
      activeUsers,
      totalIncome,
      totalExpenses,
      totalBudgets,
      quizCompletions,
      levelDistribution,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { onboarded: true } }),
      prisma.user.count({ where: { lastCheckIn: { gte: sevenDaysAgo } } }),
      prisma.incomeEntry.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.monthlyBudget.count(),
      prisma.user.count({ where: { onboarded: true, quizResult: { not: null } } }),
      prisma.user.groupBy({
        by: ["level"],
        _count: { level: true },
      }),
    ]);

    const quizRate = onboardedUsers > 0
      ? Math.round((quizCompletions / onboardedUsers) * 100)
      : 0;

    const levels: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const row of levelDistribution) {
      levels[row.level] = row._count.level;
    }

    return NextResponse.json({
      totalUsers,
      onboardedUsers,
      activeUsers,
      totalIncome: totalIncome._sum.amount ?? 0,
      totalExpenses: totalExpenses._sum.amount ?? 0,
      totalBudgets,
      quizCompletionRate: quizRate,
      levelDistribution: levels,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
