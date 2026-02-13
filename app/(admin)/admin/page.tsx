"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  onboardedUsers: number;
  activeUsers: number;
  totalIncome: number;
  totalExpenses: number;
  totalBudgets: number;
  quizCompletionRate: number;
  levelDistribution: Record<number, number>;
}

const LEVEL_NAMES: Record<number, { name: string; emoji: string; color: string }> = {
  1: { name: "Newbie", emoji: "🌱", color: "#999" },
  2: { name: "Rising Star", emoji: "⭐", color: "#FFB86C" },
  3: { name: "Pro Creator", emoji: "🚀", color: "#6C9CFF" },
  4: { name: "Money Master", emoji: "👑", color: "#50E3C2" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Failed to load stats.
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-mg-pink" },
    { label: "Active (7d)", value: stats.activeUsers, icon: Activity, color: "text-mg-teal" },
    { label: "Onboarded", value: stats.onboardedUsers, icon: UserCheck, color: "text-mg-blue" },
    { label: "Total Income", value: formatCurrency(stats.totalIncome), icon: TrendingUp, color: "text-mg-teal" },
    { label: "Total Expenses", value: formatCurrency(stats.totalExpenses), icon: TrendingDown, color: "text-mg-amber" },
    { label: "Budgets Created", value: stats.totalBudgets, icon: Wallet, color: "text-mg-blue" },
  ];

  const totalByLevel = Object.values(stats.levelDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-secondary p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((level) => {
              const count = stats.levelDistribution[level] ?? 0;
              const pct = totalByLevel > 0 ? (count / totalByLevel) * 100 : 0;
              const info = LEVEL_NAMES[level];
              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {info.emoji} {info.name}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: info.color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="text-4xl font-bold text-mg-pink">
                {stats.quizCompletionRate}%
              </div>
              <p className="text-sm text-muted-foreground">
                of onboarded users completed the quiz
              </p>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-mg-pink transition-all"
                  style={{ width: `${stats.quizCompletionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
