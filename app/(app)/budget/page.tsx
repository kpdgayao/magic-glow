"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import {
  Calculator,
  Save,
  MessageCircle,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const PRESETS = [5000, 10000, 15000, 20000];

const CATEGORY_DETAILS = {
  needs: {
    label: "Needs",
    percent: 50,
    color: "bg-mg-pink",
    examples: "Rent/board, food, transpo, phone load/WiFi, school supplies",
  },
  wants: {
    label: "Wants",
    percent: 30,
    color: "bg-mg-amber",
    examples:
      "Shopping, milk tea, Netflix/Spotify, eating out, gaming",
  },
  savings: {
    label: "Savings",
    percent: 20,
    color: "bg-mg-teal",
    examples:
      "Emergency fund, GCash/Maya savings, future goals, investing",
  },
};

export default function BudgetPage() {
  const router = useRouter();
  const [income, setIncome] = useState("");
  const [calculated, setCalculated] = useState(false);
  const [saving, setSaving] = useState(false);

  const incomeNum = parseFloat(income) || 0;
  const needs = incomeNum * 0.5;
  const wants = incomeNum * 0.3;
  const savings = incomeNum * 0.2;

  function handleCalculate() {
    if (incomeNum > 0) setCalculated(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: incomeNum }),
      });
      if (!res.ok) throw new Error();
      toast.success("Budget saved!");
    } catch {
      toast.error("Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  function handleAskAI() {
    const msg = `I earn ${formatCurrency(incomeNum)} monthly. My 50/30/20 budget is: Needs ${formatCurrency(needs)}, Wants ${formatCurrency(wants)}, Savings ${formatCurrency(savings)}. Any tips to improve my budget?`;
    router.push(`/chat?prefill=${encodeURIComponent(msg)}`);
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Budget Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          The 50/30/20 rule — simple and effective
        </p>
      </div>

      {/* Income Input */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Monthly Income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                ₱
              </span>
              <Input
                type="number"
                placeholder="0"
                value={income}
                onChange={(e) => {
                  setIncome(e.target.value);
                  setCalculated(false);
                }}
                className="pl-8 bg-background border-border text-lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setIncome(String(p));
                  setCalculated(false);
                }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-mg-pink hover:text-mg-pink transition-colors"
              >
                {formatCurrency(p)}
              </button>
            ))}
          </div>

          <Button
            onClick={handleCalculate}
            disabled={incomeNum <= 0}
            className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {calculated && (
        <>
          {/* Budget Bar */}
          <div className="h-6 rounded-full overflow-hidden flex">
            <div
              className="bg-mg-pink transition-all"
              style={{ width: "50%" }}
            />
            <div
              className="bg-mg-amber transition-all"
              style={{ width: "30%" }}
            />
            <div
              className="bg-mg-teal transition-all"
              style={{ width: "20%" }}
            />
          </div>

          {/* Category Cards */}
          {Object.entries(CATEGORY_DETAILS).map(([key, cat]) => {
            const amount =
              key === "needs" ? needs : key === "wants" ? wants : savings;
            return (
              <Card key={key} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                      <span className="font-semibold text-sm">
                        {cat.label} ({cat.percent}%)
                      </span>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cat.examples}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Budget
            </Button>
            <Button
              onClick={handleAskAI}
              className="flex-1 bg-mg-pink hover:bg-mg-pink/90 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Get AI Advice
            </Button>
          </div>

          {/* Creator Tip */}
          <Card className="border-mg-amber/20 bg-mg-amber/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-mg-amber mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-mg-amber mb-1">
                    Creator Tip
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creator income is irregular! Budget based on your lowest
                    earning month, and save extra during good months.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
