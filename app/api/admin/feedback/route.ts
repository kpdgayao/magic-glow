import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 50;
    const skip = (page - 1) * limit;

    const [feedback, total, stats] = await Promise.all([
      prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.feedback.count(),
      prisma.feedback.groupBy({
        by: ["rating"],
        _count: { rating: true },
      }),
    ]);

    const ratingCounts = { positive: 0, neutral: 0, negative: 0 };
    for (const s of stats) {
      if (s.rating === 1) ratingCounts.positive = s._count.rating;
      else if (s.rating === 0) ratingCounts.neutral = s._count.rating;
      else if (s.rating === -1) ratingCounts.negative = s._count.rating;
    }

    return NextResponse.json({
      feedback,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: ratingCounts,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Admin feedback error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
