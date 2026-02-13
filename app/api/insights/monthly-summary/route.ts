import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();

    const now = new Date();
    const months: {
      month: number;
      year: number;
      label: string;
      income: number;
      expenses: number;
      net: number;
    }[] = [];

    // Last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 1));

      const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.incomeEntry.aggregate({
          where: {
            userId: session.userId,
            date: { gte: startDate, lt: endDate },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            userId: session.userId,
            date: { gte: startDate, lt: endDate },
          },
          _sum: { amount: true },
        }),
      ]);

      const income = incomeAgg._sum.amount || 0;
      const expenses = expenseAgg._sum.amount || 0;

      months.push({
        month,
        year,
        label: d.toLocaleDateString("en-PH", { month: "short" }),
        income,
        expenses,
        net: income - expenses,
      });
    }

    return NextResponse.json({ months });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Monthly summary error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
