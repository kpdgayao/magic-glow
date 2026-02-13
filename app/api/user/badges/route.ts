import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { computeBadges } from "@/lib/badges";

export async function GET() {
  try {
    const session = await requireAuth();
    const badges = await computeBadges(session.userId);
    const earnedCount = badges.filter((b) => b.earned).length;

    return NextResponse.json({
      badges,
      earnedCount,
      totalCount: badges.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Badges error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
