"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  INCOME_SOURCES,
  INCOME_RANGES,
  FINANCIAL_GOALS,
  EMPLOYMENT_STATUSES,
  EMERGENCY_FUND_OPTIONS,
  DEBT_SITUATIONS,
} from "@/lib/constants";

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [incomeSources, setIncomeSources] = useState<string[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [financialGoal, setFinancialGoal] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [hasEmergencyFund, setHasEmergencyFund] = useState("");
  const [debtSituation, setDebtSituation] = useState("");
  const [languagePref, setLanguagePref] = useState<"ENGLISH" | "TAGLISH">(
    "ENGLISH"
  );

  function toggleSource(source: string) {
    setIncomeSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  }

  function canProceed() {
    switch (step) {
      case 1:
        return name.trim().length > 0 && age.trim().length > 0;
      case 2:
        return incomeSources.length > 0;
      case 3:
        return monthlyIncome !== null;
      case 4:
        return financialGoal !== "";
      case 5: // employment — optional
      case 6: // emergency fund — optional
      case 7: // debt — optional
      case 8: // language
        return true;
      default:
        return false;
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: parseInt(age),
          incomeSources,
          monthlyIncome,
          financialGoal,
          employmentStatus: employmentStatus || undefined,
          hasEmergencyFund: hasEmergencyFund || undefined,
          debtSituation: debtSituation || undefined,
          languagePref,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col p-4">
      {/* Progress */}
      <div className="space-y-2 mb-8 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Let&apos;s get to know you
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                What should we call you?
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-card border-border"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-card border-border"
                  min={13}
                  max={100}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Income sources
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Where does your money come from? Select all that apply.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INCOME_SOURCES.map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                    incomeSources.includes(source)
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-card border-border text-foreground hover:border-muted-foreground"
                  )}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Monthly income
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Roughly how much do you earn per month?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INCOME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setMonthlyIncome(range.value)}
                  className={cn(
                    "rounded-xl border p-4 text-center transition-colors",
                    monthlyIncome === range.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-card border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="text-lg font-semibold">{range.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Financial goal
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                What&apos;s your top money priority right now?
              </p>
            </div>
            <div className="space-y-3">
              {FINANCIAL_GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setFinancialGoal(goal.value)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-colors",
                    financialGoal === goal.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-card border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="font-medium">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                What&apos;s your setup?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                This helps us personalize your advice. Optional — you can skip this.
              </p>
            </div>
            <div className="space-y-3">
              {EMPLOYMENT_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setEmploymentStatus(status.value)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-colors",
                    employmentStatus === status.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-card border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="font-medium">{status.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Emergency fund?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Do you have savings set aside for emergencies? Optional.
              </p>
            </div>
            <div className="space-y-3">
              {EMERGENCY_FUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHasEmergencyFund(opt.value)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-colors",
                    hasEmergencyFund === opt.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-card border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Any debt?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                No judgment — this helps us give better advice. Optional.
              </p>
            </div>
            <div className="space-y-3">
              {DEBT_SITUATIONS.map((debt) => (
                <button
                  key={debt.value}
                  onClick={() => setDebtSituation(debt.value)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-colors",
                    debtSituation === debt.value
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-card border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="font-medium">{debt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                Language preference
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                How should MoneyGlow AI talk to you?
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setLanguagePref("ENGLISH")}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  languagePref === "ENGLISH"
                    ? "bg-mg-pink text-white border-mg-pink"
                    : "bg-card border-border hover:border-muted-foreground"
                )}
              >
                <p className="font-medium">English</p>
                <p
                  className={cn(
                    "text-sm mt-1",
                    languagePref === "ENGLISH"
                      ? "text-white/70"
                      : "text-muted-foreground"
                  )}
                >
                  Clear, simple English
                </p>
              </button>
              <button
                onClick={() => setLanguagePref("TAGLISH")}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  languagePref === "TAGLISH"
                    ? "bg-mg-pink text-white border-mg-pink"
                    : "bg-card border-border hover:border-muted-foreground"
                )}
              >
                <p className="font-medium">Taglish</p>
                <p
                  className={cn(
                    "text-sm mt-1",
                    languagePref === "TAGLISH"
                      ? "text-white/70"
                      : "text-muted-foreground"
                  )}
                >
                  Mix of Tagalog and English, casual style
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 pb-4">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {step < TOTAL_STEPS ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex-1 bg-mg-pink hover:bg-mg-pink/90 text-white"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 bg-mg-pink hover:bg-mg-pink/90 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Get Started
          </Button>
        )}
      </div>
    </div>
  );
}
