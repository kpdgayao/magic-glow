import { prisma } from "./prisma";

// XP awards per action
export const XP_AWARDS = {
  LOG_INCOME: 10,
  SAVE_BUDGET: 15,
  GET_DAILY_ADVICE: 20,
  COMPLETE_QUIZ: 25,
  DAILY_CHECK_IN: 5,
  LOG_EXPENSE: 5,
} as const;

export type XPAction = keyof typeof XP_AWARDS;

// Level definitions
interface LevelDef {
  level: number;
  name: string;
  emoji: string;
  minXP: number;
}

const LEVELS: LevelDef[] = [
  { level: 1, name: "Newbie", emoji: "🌱", minXP: 0 },
  { level: 2, name: "Rising Star", emoji: "⭐", minXP: 100 },
  { level: 3, name: "Pro Creator", emoji: "🚀", minXP: 300 },
  { level: 4, name: "Money Master", emoji: "👑", minXP: 600 },
];

// Glow score labels
interface GlowDef {
  label: string;
  emoji: string;
  min: number;
}

const GLOW_LABELS: GlowDef[] = [
  { label: "Needs TLC", emoji: "🕯️", min: 0 },
  { label: "Flickering", emoji: "🔥", min: 40 },
  { label: "Glowing", emoji: "✨", min: 60 },
  { label: "On Fire", emoji: "💎", min: 80 },
];

export function calculateLevel(xp: number): LevelDef {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
  }
  return current;
}

export function getNextLevel(xp: number) {
  const current = calculateLevel(xp);
  const next = LEVELS.find((l) => l.minXP > xp);
  if (!next) return null;
  return { ...next, xpNeeded: next.minXP - xp, progress: ((xp - current.minXP) / (next.minXP - current.minXP)) * 100 };
}

export function getGlowLabel(score: number): GlowDef {
  let current = GLOW_LABELS[0];
  for (const g of GLOW_LABELS) {
    if (score >= g.min) current = g;
  }
  return current;
}

export async function awardXP(userId: string, action: XPAction) {
  const xpAmount = XP_AWARDS[action];
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpAmount } },
    select: { xp: true },
  });

  // Recalculate level
  const level = calculateLevel(user.xp);
  await prisma.user.update({
    where: { id: userId },
    data: { level: level.level },
  });

  return { xp: user.xp, level: level.level, xpAwarded: xpAmount };
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { lastCheckIn: true, streakCount: true, longestStreak: true },
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastCheckIn) {
    const lastDate = new Date(user.lastCheckIn);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already checked in today
      return { streakCount: user.streakCount, longestStreak: user.longestStreak, isNew: false };
    }

    if (diffDays === 1) {
      // Consecutive day
      const newStreak = user.streakCount + 1;
      const newLongest = Math.max(newStreak, user.longestStreak);
      await prisma.user.update({
        where: { id: userId },
        data: { streakCount: newStreak, longestStreak: newLongest, lastCheckIn: now },
      });
      return { streakCount: newStreak, longestStreak: newLongest, isNew: true };
    }

    // Streak broken
    await prisma.user.update({
      where: { id: userId },
      data: { streakCount: 1, lastCheckIn: now },
    });
    return { streakCount: 1, longestStreak: user.longestStreak, isNew: true };
  }

  // First check-in ever
  await prisma.user.update({
    where: { id: userId },
    data: { streakCount: 1, longestStreak: Math.max(1, user.longestStreak), lastCheckIn: now },
  });
  return { streakCount: 1, longestStreak: Math.max(1, user.longestStreak), isNew: true };
}

export async function calculateGlowScore(userId: string): Promise<number> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [user, incomeCount, budgetCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { streakCount: true, xp: true },
    }),
    prisma.incomeEntry.count({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.budgetSnapshot.count({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  // Tracking entries (0-30 pts): 1pt per entry, max 30
  const trackingScore = Math.min(incomeCount, 30);

  // Budget frequency (0-20 pts): ~5pts per budget save, max 20
  const budgetScore = Math.min(budgetCount * 5, 20);

  // Streak (0-25 pts): ~3.5pts per day, max 25
  const streakScore = Math.min(Math.round(user.streakCount * 3.5), 25);

  // XP activity (0-25 pts): scaled by XP
  const xpScore = Math.min(Math.round(user.xp / 24), 25);

  return trackingScore + budgetScore + streakScore + xpScore;
}
