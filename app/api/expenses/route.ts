import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/gamification";
import { expenseSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const now = new Date();
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()));

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.userId,
        date: { gte: startDate, lt: endDate },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Expenses GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        userId: session.userId,
        category: data.category,
        subcategory: data.subcategory,
        amount: data.amount,
        date: new Date(data.date),
        note: data.note || null,
      },
    });

    // Award XP
    await awardXP(session.userId, "LOG_EXPENSE");

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Verify ownership
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Expenses DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
