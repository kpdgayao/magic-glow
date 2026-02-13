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
import { Save, LogOut, Loader2, Brain } from "lucide-react";
import { toast } from "sonner";
import { QUIZ_RESULTS, type QuizResultType } from "@/lib/quiz-data";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  incomeSources: string[];
  monthlyIncome: number | null;
  financialGoal: string | null;
  languagePref: "ENGLISH" | "TAGLISH";
  quizResult: QuizResultType | null;
}

const INCOME_SOURCES = [
  "TikTok",
  "YouTube",
  "Instagram",
  "Facebook",
  "GCash",
  "Maya",
  "Shopee",
  "Lazada",
  "Freelance",
  "Allowance",
  "Part-time Job",
  "Other",
];

const FINANCIAL_GOALS = [
  { value: "SAVE_EMERGENCY_FUND", label: "Save Emergency Fund" },
  { value: "PAY_OFF_DEBT", label: "Pay Off Debt" },
  { value: "START_INVESTING", label: "Start Investing" },
  { value: "BUDGET_BETTER", label: "Budget Better" },
  { value: "GROW_CREATOR_INCOME", label: "Grow Creator Income" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [incomeSources, setIncomeSources] = useState<string[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");
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
        setLanguagePref(data.languagePref || "ENGLISH");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
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

      {/* Edit Form */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Age</Label>
            <Input
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
            <Label>Monthly Income (₱)</Label>
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Financial Goal</Label>
            <div className="space-y-2">
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
