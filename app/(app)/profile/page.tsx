"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Save, LogOut, Loader2, Brain, Lock, Shield, UserPlus } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { toast } from "sonner";
import { QUIZ_RESULTS, type QuizResultType } from "@/lib/quiz-data";
import {
  INCOME_SOURCES,
  FINANCIAL_GOALS,
  EMPLOYMENT_STATUSES,
  EMERGENCY_FUND_OPTIONS,
  DEBT_SITUATIONS,
} from "@/lib/constants";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  incomeSources: string[];
  monthlyIncome: number | null;
  financialGoal: string | null;
  employmentStatus: string | null;
  hasEmergencyFund: string | null;
  debtSituation: string | null;
  languagePref: "ENGLISH" | "TAGLISH";
  quizResult: QuizResultType | null;
  isAdmin?: boolean;
}

interface BadgeData {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
  earned: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [badgeCount, setBadgeCount] = useState({ earned: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [incomeSources, setIncomeSources] = useState<string[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [hasEmergencyFund, setHasEmergencyFund] = useState("");
  const [debtSituation, setDebtSituation] = useState("");
  const [languagePref, setLanguagePref] = useState<"ENGLISH" | "TAGLISH">(
    "ENGLISH"
  );

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data: UserProfile) => {
        setUser(data);
        setName(data.name || "");
        setAge(data.age?.toString() || "");
        setIncomeSources(data.incomeSources || []);
        setMonthlyIncome(data.monthlyIncome?.toString() || "");
        setFinancialGoal(data.financialGoal || "");
        setEmploymentStatus(data.employmentStatus || "");
        setHasEmergencyFund(data.hasEmergencyFund || "");
        setDebtSituation(data.debtSituation || "");
        setLanguagePref(data.languagePref || "ENGLISH");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));

    fetch("/api/user/badges")
      .then((res) => res.json())
      .then((data) => {
        setBadges(data.badges || []);
        setBadgeCount({ earned: data.earnedCount || 0, total: data.totalCount || 0 });
      })
      .catch(() => {});
  }, []);

  function toggleSource(source: string) {
    setIncomeSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: parseInt(age) || undefined,
          incomeSources,
          monthlyIncome: parseFloat(monthlyIncome) || undefined,
          financialGoal: financialGoal || undefined,
          employmentStatus: employmentStatus || null,
          hasEmergencyFund: hasEmergencyFund || null,
          debtSituation: debtSituation || null,
          languagePref,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-mg-pink" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Admin Dashboard Link */}
      {user?.isAdmin && (
        <Link href="/admin">
          <Card className="border-mg-teal/30 bg-card hover:border-mg-teal/60 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mg-teal/10">
                <Shield className="h-5 w-5 text-mg-teal" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Admin Dashboard</p>
                <p className="text-xs text-muted-foreground">
                  View stats, manage users
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quiz Result */}
      {user?.quizResult && QUIZ_RESULTS[user.quizResult] && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">
              {QUIZ_RESULTS[user.quizResult].emoji}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Money Personality</p>
              <Badge
                style={{
                  backgroundColor:
                    QUIZ_RESULTS[user.quizResult].color + "20",
                  color: QUIZ_RESULTS[user.quizResult].color,
                }}
                className="border-0"
              >
                {QUIZ_RESULTS[user.quizResult].title}
              </Badge>
            </div>
            <Link href="/quiz">
              <Button variant="outline" size="sm" className="shrink-0">
                <Brain className="h-4 w-4 mr-1" />
                Retake
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      {!user?.quizResult && (
        <Link href="/quiz">
          <Button
            variant="outline"
            className="w-full border-mg-blue text-mg-blue hover:bg-mg-blue/10"
          >
            <Brain className="h-4 w-4 mr-2" />
            Take Money Personality Quiz
          </Button>
        </Link>
      )}

      {/* Achievement Badges */}
      {badges.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Achievements</p>
              <span className="text-xs text-muted-foreground">
                {badgeCount.earned}/{badgeCount.total}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 text-center"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                    style={
                      badge.earned
                        ? { backgroundColor: badge.color + "20" }
                        : { backgroundColor: "rgba(255,255,255,0.05)" }
                    }
                  >
                    {badge.earned ? (
                      badge.emoji
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <span
                    className={`text-xs leading-tight ${
                      badge.earned
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-age">Age</Label>
            <Input
              id="profile-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Income Sources</Label>
            <div className="flex flex-wrap gap-2">
              {INCOME_SOURCES.map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                    incomeSources.includes(source)
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-background border-border hover:border-muted-foreground"
                  )}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-income">Monthly Income (₱)</Label>
            <Input
              id="profile-income"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Financial Goal</Label>
            <div className="space-y-3">
              {FINANCIAL_GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setFinancialGoal(goal.value)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                    financialGoal === goal.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-background border-border hover:border-muted-foreground"
                  )}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Employment Status</Label>
            <div className="space-y-3">
              {EMPLOYMENT_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    setEmploymentStatus(
                      employmentStatus === status.value ? "" : status.value
                    )
                  }
                  className={cn(
                    "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                    employmentStatus === status.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-background border-border hover:border-muted-foreground"
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emergency Fund</Label>
            <div className="flex flex-wrap gap-2">
              {EMERGENCY_FUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setHasEmergencyFund(
                      hasEmergencyFund === opt.value ? "" : opt.value
                    )
                  }
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                    hasEmergencyFund === opt.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-background border-border hover:border-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Debt Situation</Label>
            <div className="flex flex-wrap gap-2">
              {DEBT_SITUATIONS.map((debt) => (
                <button
                  key={debt.value}
                  onClick={() =>
                    setDebtSituation(
                      debtSituation === debt.value ? "" : debt.value
                    )
                  }
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                    debtSituation === debt.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-background border-border hover:border-muted-foreground"
                  )}
                >
                  {debt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Language Preference</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguagePref("ENGLISH")}
                className={cn(
                  "flex-1 rounded-lg border p-3 text-sm font-medium transition-colors",
                  languagePref === "ENGLISH"
                    ? "bg-mg-pink text-white border-mg-pink"
                    : "bg-background border-border hover:border-muted-foreground"
                )}
              >
                English
              </button>
              <button
                onClick={() => setLanguagePref("TAGLISH")}
                className={cn(
                  "flex-1 rounded-lg border p-3 text-sm font-medium transition-colors",
                  languagePref === "TAGLISH"
                    ? "bg-mg-pink text-white border-mg-pink"
                    : "bg-background border-border hover:border-muted-foreground"
                )}
              >
                Taglish
              </button>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Invite Friends */}
      <Card className="border-mg-amber/30 bg-card">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mg-amber/10">
            <UserPlus className="h-5 w-5 text-mg-amber" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Invite Friends</p>
            <p className="text-xs text-muted-foreground">
              Share MoneyGlow with your creator friends
            </p>
          </div>
          <ShareButton
            title="MoneyGlow — Your Financial Glow-Up Starts Here"
            text="I've been leveling up my finances with MoneyGlow! Free financial literacy app for Filipino creators"
            url="/"
            utmSource="profile_invite"
            variant="icon"
          />
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
