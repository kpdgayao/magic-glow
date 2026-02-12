import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireAuth();

    const snapshots = await prisma.budgetSnapshot.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Budget GET error:", error);
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
    const { income } = budgetSchema.parse(body);

    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;

    const snapshot = await prisma.budgetSnapshot.create({
      data: {
        userId: session.userId,
        income,
        needs,
        wants,
        savings,
      },
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
