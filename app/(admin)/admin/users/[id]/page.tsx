"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Shield,
  Zap,
  Flame,
  Trophy,
  Lock,
  MessageSquare,
  DollarSign,
  Receipt,
  Wallet,
  Lightbulb,
} from "lucide-react";

interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
  earned: boolean;
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string | null;
    age: number | null;
    incomeSources: string[];
    monthlyIncome: number | null;
    financialGoal: string | null;
    languagePref: string;
    quizResult: string | null;
    employmentStatus: string | null;
    hasEmergencyFund: string | null;
    debtSituation: string | null;
    isAdmin: boolean;
    onboarded: boolean;
    streakCount: number;
    lastCheckIn: string | null;
    longestStreak: number;
    xp: number;
    level: number;
    createdAt: string;
    updatedAt: string;
    _count: {
      incomeEntries: number;
      expenses: number;
      monthlyBudgets: number;
      chatMessages: number;
      dailyAdvice: number;
    };
  };
  glowScore: number;
  badges: BadgeDef[];
}

const LEVEL_NAMES: Record<number, { name: string; emoji: string }> = {
  1: { name: "Newbie", emoji: "🌱" },
  2: { name: "Rising Star", emoji: "⭐" },
  3: { name: "Pro Creator", emoji: "🚀" },
  4: { name: "Money Master", emoji: "👑" },
};

function formatEnum(val: string | null): string {
  if (!val) return "--";
  return val.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading user...
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>User not found.</p>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  const { user, glowScore, badges } = data;
  const level = LEVEL_NAMES[user.level] ?? { name: `Level ${user.level}`, emoji: "" };
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-6">
      <Link href="/admin/users">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mg-pink/10 text-xl">
          {level.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold">
              {user.name || user.email}
            </h1>
            {user.isAdmin && (
              <Badge className="gap-1 bg-mg-amber/10 text-mg-amber border-mg-amber/20">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="mx-auto mb-1 h-5 w-5 text-mg-amber" />
            <p className="text-lg font-bold">{level.emoji} Lv.{user.level}</p>
            <p className="text-xs text-muted-foreground">{user.xp} XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className="mb-1 block text-xl">
              {glowScore >= 80 ? "💎" : glowScore >= 60 ? "✨" : glowScore >= 40 ? "🔥" : "🕯️"}
            </span>
            <p className="text-lg font-bold">{glowScore}</p>
            <p className="text-xs text-muted-foreground">Glow Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="mx-auto mb-1 h-5 w-5 text-mg-pink" />
            <p className="text-lg font-bold">{user.streakCount}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="mx-auto mb-1 h-5 w-5 text-mg-teal" />
            <p className="text-lg font-bold">{user.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Age" value={user.age?.toString() ?? "--"} />
            <Row label="Employment" value={formatEnum(user.employmentStatus)} />
            <Row
              label="Income Sources"
              value={user.incomeSources.length > 0 ? user.incomeSources.join(", ") : "--"}
            />
            <Row
              label="Monthly Income"
              value={user.monthlyIncome ? formatCurrency(user.monthlyIncome) : "--"}
            />
            <Row label="Financial Goal" value={formatEnum(user.financialGoal)} />
            <Row label="Emergency Fund" value={formatEnum(user.hasEmergencyFund)} />
            <Row label="Debt" value={formatEnum(user.debtSituation)} />
            <Row label="Language" value={user.languagePref} />
            <Row label="Quiz Result" value={user.quizResult ?? "--"} />
            <Row label="Onboarded" value={user.onboarded ? "Yes" : "No"} />
          </CardContent>
        </Card>

        {/* Activity Counts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActivityRow icon={DollarSign} label="Income Entries" count={user._count.incomeEntries} color="text-mg-teal" />
            <ActivityRow icon={Receipt} label="Expenses" count={user._count.expenses} color="text-mg-pink" />
            <ActivityRow icon={Wallet} label="Monthly Budgets" count={user._count.monthlyBudgets} color="text-mg-blue" />
            <ActivityRow icon={MessageSquare} label="Chat Messages" count={user._count.chatMessages} color="text-mg-amber" />
            <ActivityRow icon={Lightbulb} label="Daily Advice" count={user._count.dailyAdvice} color="text-mg-teal" />
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Badges ({earnedCount}/{badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 rounded-lg p-2 text-center"
                style={{
                  backgroundColor: badge.earned ? `${badge.color}15` : undefined,
                }}
              >
                {badge.earned ? (
                  <span className="text-2xl">{badge.emoji}</span>
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground/40" />
                )}
                <span
                  className="text-[11px] font-medium leading-tight"
                  style={{ color: badge.earned ? badge.color : undefined }}
                >
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums">{count}</span>
    </div>
  );
}
