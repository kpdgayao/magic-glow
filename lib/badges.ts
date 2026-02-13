import { prisma } from "./prisma";

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
  earned: boolean;
}

const BADGE_DEFS: Omit<BadgeDef, "earned">[] = [
  {
    id: "first_peso",
    emoji: "\u{1F4B0}",
    name: "First Peso",
    description: "Log your first income entry",
    color: "#FFB86C",
  },
  {
    id: "hustler",
    emoji: "\u{1F525}",
    name: "Hustler",
    description: "Log 10+ income entries",
    color: "#FF6B9D",
  },
  {
    id: "money_machine",
    emoji: "\u{1F911}",
    name: "Money Machine",
    description: "Log 50+ income entries",
    color: "#50E3C2",
  },
  {
    id: "budget_boss",
    emoji: "\u{1F4CB}",
    name: "Budget Boss",
    description: "Create your first monthly budget",
    color: "#6C9CFF",
  },
  {
    id: "self_aware",
    emoji: "\u{1F9E0}",
    name: "Self-Aware",
    description: "Complete the money personality quiz",
    color: "#FFB86C",
  },
  {
    id: "week_warrior",
    emoji: "\u26A1",
    name: "Week Warrior",
    description: "7+ day streak",
    color: "#FF6B9D",
  },
  {
    id: "monthly_master",
    emoji: "\u{1F451}",
    name: "Monthly Master",
    description: "30+ day streak",
    color: "#50E3C2",
  },
  {
    id: "rising_star",
    emoji: "\u2B50",
    name: "Rising Star",
    description: "Reach Level 2",
    color: "#FFB86C",
  },
  {
    id: "money_master",
    emoji: "\u{1F48E}",
    name: "Money Master",
    description: "Reach Level 4 (max)",
    color: "#50E3C2",
  },
  {
    id: "tracker",
    emoji: "\u{1F4DD}",
    name: "Tracker",
    description: "Log your first expense",
    color: "#6C9CFF",
  },
];

export async function computeBadges(userId: string): Promise<BadgeDef[]> {
  const [user, incomeCount, budgetCount, expenseCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        quizResult: true,
        longestStreak: true,
        level: true,
      },
    }),
    prisma.incomeEntry.count({ where: { userId } }),
    prisma.monthlyBudget.count({ where: { userId } }),
    prisma.expense.count({ where: { userId } }),
  ]);

  const conditions: Record<string, boolean> = {
    first_peso: incomeCount >= 1,
    hustler: incomeCount >= 10,
    money_machine: incomeCount >= 50,
    budget_boss: budgetCount >= 1,
    self_aware: user.quizResult !== null,
    week_warrior: user.longestStreak >= 7,
    monthly_master: user.longestStreak >= 30,
    rising_star: user.level >= 2,
    money_master: user.level >= 4,
    tracker: expenseCount >= 1,
  };

  return BADGE_DEFS.map((badge) => ({
    ...badge,
    earned: conditions[badge.id] ?? false,
  }));
}
