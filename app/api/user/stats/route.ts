import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateLevel,
  getNextLevel,
  getGlowLabel,
  calculateGlowScore,
} from "@/lib/gamification";

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: {
        xp: true,
        level: true,
        streakCount: true,
        longestStreak: true,
      },
    });

    const levelInfo = calculateLevel(user.xp);
    const nextLevel = getNextLevel(user.xp);
    const glowScore = await calculateGlowScore(session.userId);
    const glowInfo = getGlowLabel(glowScore);

    return NextResponse.json({
      xp: user.xp,
      level: levelInfo.level,
      levelName: levelInfo.name,
      levelEmoji: levelInfo.emoji,
      nextLevel: nextLevel
        ? {
            level: nextLevel.level,
            name: nextLevel.name,
            emoji: nextLevel.emoji,
            xpNeeded: nextLevel.xpNeeded,
            progress: nextLevel.progress,
          }
        : null,
      streakCount: user.streakCount,
      longestStreak: user.longestStreak,
      glowScore,
      glowLabel: glowInfo.label,
      glowEmoji: glowInfo.emoji,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
