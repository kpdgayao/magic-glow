import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { incomeEntrySchema } from "@/lib/validations";
import { awardXP } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    let where: Record<string, unknown> = { userId: session.userId };

    if (monthParam && yearParam) {
      const month = parseInt(monthParam);
      const year = parseInt(yearParam);
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 1));
      where = { ...where, date: { gte: startDate, lt: endDate } };
    }

    const entries = await prisma.incomeEntry.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
    });

    // Calculate total for the query
    const total = entries.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ entries, total });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Income GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = incomeEntrySchema.parse(body);

    const entry = await prisma.incomeEntry.create({
      data: {
        userId: session.userId,
        source: data.source,
        type: data.type,
        amount: data.amount,
        date: new Date(data.date),
        note: data.note,
      },
    });

    await awardXP(session.userId, "LOG_INCOME");

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Income POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Verify ownership
    const entry = await prisma.incomeEntry.findFirst({
      where: { id, userId: session.userId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.incomeEntry.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Income DELETE error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
