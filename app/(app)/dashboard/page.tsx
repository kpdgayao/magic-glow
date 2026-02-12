"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  TrendingUp,
  Brain,
  Wallet,
  Sparkles,
} from "lucide-react";

interface UserData {
  name: string | null;
  quizResult: string | null;
}

const FEATURES = [
  {
    href: "/budget",
    icon: Calculator,
    label: "Budget",
    desc: "50/30/20 Calculator",
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
    href: "/quiz",
    icon: Brain,
    label: "Quiz",
    desc: "Money Personality",
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

const QUIZ_LABELS: Record<string, { title: string; color: string }> = {
  YOLO: { title: "YOLO Spender", color: "bg-mg-pink/20 text-mg-pink" },
  CHILL: { title: "Chill Saver", color: "bg-mg-amber/20 text-mg-amber" },
  PLAN: { title: "Planner", color: "bg-mg-blue/20 text-mg-blue" },
  MASTER: { title: "Money Master", color: "bg-mg-teal/20 text-mg-teal" },
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(setUser)
      .catch(() => {});
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

      {/* Quiz result badge */}
      {user?.quizResult && QUIZ_LABELS[user.quizResult] && (
        <Badge
          className={`${QUIZ_LABELS[user.quizResult].color} border-0 text-xs`}
        >
          {QUIZ_LABELS[user.quizResult].title}
        </Badge>
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

      {/* AI Tip Card */}
      <Card className="border-mg-pink/20 bg-mg-pink/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-mg-pink mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-mg-pink mb-1">
                MoneyGlow Tip
              </p>
              <p className="text-sm text-muted-foreground">
                Start tracking every income — even ₱50 from a TikTok gift.
                Small amounts add up! Use the Track tab to build your income
                history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
