import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
  rating: z.number().int().min(-1).max(1),
  reason: z.string().max(500).optional(),
  context: z.string().max(50).optional(),
  page: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = feedbackSchema.parse(body);

    await prisma.feedback.create({
      data: {
        userId: session.userId,
        rating: data.rating,
        reason: data.reason || null,
        context: data.context || null,
        page: data.page || null,
      },
    });

    return NextResponse.json({ message: "Feedback saved" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
