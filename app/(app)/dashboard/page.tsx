"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMessage } from "@/lib/format-markdown";
import {
  Calculator,
  TrendingUp,
  Lightbulb,
  Wallet,
  Sparkles,
  Flame,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  name: string | null;
  quizResult: string | null;
}

interface StatsData {
  xp: number;
  level: number;
  levelName: string;
  levelEmoji: string;
  nextLevel: {
    level: number;
    name: string;
    emoji: string;
    xpNeeded: number;
    progress: number;
  } | null;
  streakCount: number;
  longestStreak: number;
  glowScore: number;
  glowLabel: string;
  glowEmoji: string;
}

const FEATURES = [
  {
    href: "/budget",
    icon: Calculator,
    label: "Budget",
    desc: "Budget & Expenses",
    color: "text-mg-pink",
    bg: "bg-mg-pink/10",
  },
  {
    href: "/grow",
    icon: TrendingUp,
    label: "Grow",
    desc: "Compound Interest",
    color: "text-mg-amber",
    bg: "bg-mg-amber/10",
  },
  {
    href: "/advice",
    icon: Lightbulb,
    label: "Advice",
    desc: "Daily Money Tips",
    color: "text-mg-blue",
    bg: "bg-mg-blue/10",
  },
  {
    href: "/tracker",
    icon: Wallet,
    label: "Track",
    desc: "Income Tracker",
    color: "text-mg-teal",
    bg: "bg-mg-teal/10",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [adviceText, setAdviceText] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(setUser)
      .catch(() => toast.error("Failed to load profile"));

    fetch("/api/user/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"));

    // Use peek=true so dashboard never triggers slow generation
    fetch("/api/advice?peek=true")
      .then((res) => res.json())
      .then((data) => setAdviceText(data.advice || null))
      .catch(() => {})
      .finally(() => setAdviceLoading(false));
  }, []);

  const greeting = user?.name ? `Hi ${user.name}!` : "Hi there!";

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
            {greeting}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your financial glow-up starts here
          </p>
        </div>
        <Link href="/profile">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mg-pink/20 text-mg-pink font-semibold">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
        </Link>
      </div>

      {/* Glow Score + Streak */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-mg-amber/20 bg-mg-amber/5">
            <CardContent className="p-3 text-center">
              <p className="text-2xl">{stats.glowEmoji}</p>
              <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-mg-amber">
                {stats.glowScore}
              </p>
              <p className="text-[10px] text-muted-foreground">{stats.glowLabel}</p>
            </CardContent>
          </Card>
          <Card className="border-mg-pink/20 bg-mg-pink/5">
            <CardContent className="p-3 text-center">
              <Flame className="h-6 w-6 text-mg-pink mx-auto" />
              <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-mg-pink">
                {stats.streakCount}
              </p>
              <p className="text-[10px] text-muted-foreground">
                day streak {stats.levelEmoji} Lv.{stats.level}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* XP Progress */}
      {stats?.nextLevel && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {stats.levelEmoji} {stats.levelName}
            </span>
            <span>
              {stats.nextLevel.emoji} {stats.nextLevel.name} ({stats.nextLevel.xpNeeded} XP to go)
            </span>
          </div>
          <Progress value={stats.nextLevel.progress} className="h-2" />
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <Link key={f.href} href={f.href}>
            <Card className="border-border bg-card hover:border-muted-foreground/30 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 space-y-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}
                >
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Daily Advice Teaser */}
      <Link href="/advice">
        <Card className="border-mg-pink/20 bg-mg-pink/5 hover:border-mg-pink/40 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-mg-pink mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-mg-pink mb-1">
                  Today&apos;s Money Tip
                </p>
                {adviceLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading your daily tip...
                  </div>
                ) : adviceText ? (
                  <div
                    className="text-sm text-muted-foreground line-clamp-2
                      [&_p]:inline [&_strong]:text-muted-foreground [&_em]:text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(adviceText),
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tap to get your personalized daily advice
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
