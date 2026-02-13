import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthlyBudgetSchema } from "@/lib/validations";
import { awardXP } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()));

    // Get or auto-create monthly budget
    let budget = await prisma.monthlyBudget.findUnique({
      where: {
        userId_month_year: {
          userId: session.userId,
          month,
          year,
        },
      },
    });

    // Get aggregated spent per category and tracked income for this month
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const [expenses, incomeAgg] = await Promise.all([
      prisma.expense.groupBy({
        by: ["category"],
        where: {
          userId: session.userId,
          date: { gte: startDate, lt: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.incomeEntry.aggregate({
        where: {
          userId: session.userId,
          date: { gte: startDate, lt: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const trackedIncome = incomeAgg._sum.amount || 0;

    const spent = {
      needs: 0,
      wants: 0,
      savings: 0,
      total: 0,
    };

    for (const e of expenses) {
      const key = e.category.toLowerCase() as "needs" | "wants" | "savings";
      spent[key] = e._sum.amount || 0;
      spent.total += e._sum.amount || 0;
    }

    return NextResponse.json({ budget, spent, trackedIncome });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Monthly budget GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = monthlyBudgetSchema.parse(body);

    const now = new Date();
    const month = data.month || now.getMonth() + 1;
    const year = data.year || now.getFullYear();

    const needs = Math.round(data.income * 0.5);
    const wants = Math.round(data.income * 0.3);
    const savings = Math.round(data.income * 0.2);

    const budget = await prisma.monthlyBudget.upsert({
      where: {
        userId_month_year: {
          userId: session.userId,
          month,
          year,
        },
      },
      create: {
        userId: session.userId,
        month,
        year,
        income: data.income,
        needs,
        wants,
        savings,
      },
      update: {
        income: data.income,
        needs,
        wants,
        savings,
      },
    });

    // Award XP for saving a budget
    await awardXP(session.userId, "SAVE_BUDGET");

    return NextResponse.json({ budget });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Monthly budget POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
