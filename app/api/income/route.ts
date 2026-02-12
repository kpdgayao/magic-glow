import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { incomeEntrySchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireAuth();

    const entries = await prisma.incomeEntry.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json(entries);
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
