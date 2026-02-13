"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  MessageCircle,
  Lightbulb,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { EXPENSE_SUBCATEGORIES, BUDGET_PRESETS, MONTHS } from "@/lib/constants";

interface MonthlyBudget {
  id: string;
  income: number;
  needs: number;
  wants: number;
  savings: number;
  month: number;
  year: number;
}

interface Spent {
  needs: number;
  wants: number;
  savings: number;
  total: number;
}

interface Expense {
  id: string;
  category: "NEEDS" | "WANTS" | "SAVINGS";
  subcategory: string;
  amount: number;
  note: string | null;
  date: string;
}

const CATEGORY_CONFIG = {
  NEEDS: { label: "Needs (50%)", color: "bg-mg-pink", textColor: "text-mg-pink", dotColor: "bg-mg-pink" },
  WANTS: { label: "Wants (30%)", color: "bg-mg-amber", textColor: "text-mg-amber", dotColor: "bg-mg-amber" },
  SAVINGS: { label: "Savings (20%)", color: "bg-mg-teal", textColor: "text-mg-teal", dotColor: "bg-mg-teal" },
};

export default function BudgetPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [spent, setSpent] = useState<Spent>({ needs: 0, wants: 0, savings: 0, total: 0 });
  const [trackedIncome, setTrackedIncome] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expCategory, setExpCategory] = useState<"NEEDS" | "WANTS" | "SAVINGS">("NEEDS");
  const [expSubcategory, setExpSubcategory] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expNote, setExpNote] = useState("");
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [addingExpense, setAddingExpense] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetRes, expensesRes] = await Promise.all([
        fetch(`/api/monthly-budget?month=${month}&year=${year}`),
        fetch(`/api/expenses?month=${month}&year=${year}`),
      ]);

      const budgetData = await budgetRes.json();
      const expensesData = await expensesRes.json();

      setBudget(budgetData.budget);
      setSpent(budgetData.spent || { needs: 0, wants: 0, savings: 0, total: 0 });
      setTrackedIncome(budgetData.trackedIncome || 0);
      setExpenses(expensesData.expenses || []);

      if (!budgetData.budget) {
        setShowSetup(true);
        // Auto-fill income input with tracked income if available
        if (budgetData.trackedIncome > 0) {
          setIncomeInput(String(budgetData.trackedIncome));
        }
      } else {
        setShowSetup(false);
      }
    } catch {
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  async function handleSaveBudget() {
    const income = parseFloat(incomeInput);
    if (!income || income <= 0) return;
    setSavingBudget(true);
    try {
      const res = await fetch("/api/monthly-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income, month, year }),
      });
      if (!res.ok) throw new Error();
      toast.success("Budget saved! +15 XP");
      setShowSetup(false);
      setIncomeInput("");
      fetchData();
    } catch {
      toast.error("Failed to save budget");
    } finally {
      setSavingBudget(false);
    }
  }

  async function handleAddExpense() {
    const amount = parseFloat(expAmount);
    if (!amount || amount <= 0 || !expSubcategory) return;
    setAddingExpense(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expCategory,
          subcategory: expSubcategory,
          amount,
          date: expDate,
          note: expNote || undefined,
        }),
      });
      if (!res.ok) throw new Error();

      // Check if over budget after adding
      const catKey = expCategory.toLowerCase() as "needs" | "wants" | "savings";
      const newSpent = spent[catKey] + amount;
      const budgeted = budget ? budget[catKey] : 0;
      if (budget && newSpent > budgeted) {
        toast.warning(
          `${CATEGORY_CONFIG[expCategory].label.split(" ")[0]} is over budget!`,
          { description: `${formatCurrency(newSpent)} spent of ${formatCurrency(budgeted)} budgeted` }
        );
      } else {
        toast.success("Expense added! +5 XP");
      }

      setExpAmount("");
      setExpNote("");
      setExpSubcategory("");
      setShowExpenseForm(false);
      fetchData();
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setAddingExpense(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Expense deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete expense");
    }
  }

  function handleAskAI() {
    if (!budget) return;
    const msg = `I earn ${formatCurrency(budget.income)} monthly. My 50/30/20 budget is: Needs ${formatCurrency(budget.needs)}, Wants ${formatCurrency(budget.wants)}, Savings ${formatCurrency(budget.savings)}. This month I've spent: Needs ${formatCurrency(spent.needs)}, Wants ${formatCurrency(spent.wants)}, Savings ${formatCurrency(spent.savings)}. Any tips to improve my budget?`;
    router.push(`/chat?prefill=${encodeURIComponent(msg)}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-mg-pink" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-28">
      {/* Header */}
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Budget
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your spending with 50/30/20
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} aria-label="Previous month" className="p-2.5 rounded-lg hover:bg-card transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-semibold">{MONTHS[month - 1]} {year}</p>
        <button onClick={nextMonth} aria-label="Next month" className="p-2.5 rounded-lg hover:bg-card transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Setup View (no budget yet) */}
      {showSetup ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <p className="font-semibold">Set Your Monthly Budget</p>
              <p className="text-xs text-muted-foreground">
                Enter your income to create a 50/30/20 budget
              </p>
            </div>
            <div className="space-y-2">
              <Label>Monthly Income</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  &#8369;
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="pl-8 bg-background border-border text-lg"
                />
              </div>
            </div>
            {trackedIncome > 0 && (
              <button
                onClick={() => setIncomeInput(String(trackedIncome))}
                className="w-full rounded-lg border border-mg-teal/30 bg-mg-teal/5 p-3 text-left transition-colors hover:border-mg-teal/50"
              >
                <p className="text-xs text-mg-teal font-medium">Use tracked income</p>
                <p className="text-sm font-semibold">{formatCurrency(trackedIncome)} <span className="text-xs text-muted-foreground font-normal">earned this month</span></p>
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setIncomeInput(String(p))}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-mg-pink hover:text-mg-pink transition-colors"
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
            <Button
              onClick={handleSaveBudget}
              disabled={!parseFloat(incomeInput) || savingBudget}
              className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white"
            >
              {savingBudget ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Budget
            </Button>
          </CardContent>
        </Card>
      ) : budget ? (
        <>
          {/* Budget Summary */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Monthly Budget</p>
                <button
                  onClick={() => {
                    setIncomeInput(String(budget.income));
                    setShowSetup(true);
                  }}
                  aria-label="Edit monthly budget"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-lg font-bold">{formatCurrency(spent.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">of</p>
                  <p className="text-lg font-bold text-muted-foreground">{formatCurrency(budget.income)}</p>
                </div>
              </div>
              {/* Overall progress bar */}
              <div className="h-3 rounded-full overflow-hidden bg-border">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    spent.total / budget.income > 1
                      ? "bg-red-500"
                      : spent.total / budget.income > 0.8
                      ? "bg-mg-amber"
                      : "bg-mg-teal"
                  )}
                  style={{ width: `${Math.min((spent.total / budget.income) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(Math.max(budget.income - spent.total, 0))} remaining</span>
                {trackedIncome > 0 && (
                  <span className="text-mg-teal">
                    {formatCurrency(trackedIncome)} earned
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {(["NEEDS", "WANTS", "SAVINGS"] as const).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const catKey = cat.toLowerCase() as "needs" | "wants" | "savings";
            const budgeted = budget[catKey];
            const spentAmt = spent[catKey];
            const remaining = budgeted - spentAmt;
            const pct = budgeted > 0 ? (spentAmt / budgeted) * 100 : 0;
            const isOver = spentAmt > budgeted;

            return (
              <Card key={cat} className="border-border bg-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${config.dotColor}`} />
                      <span className="font-semibold text-sm">{config.label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(spentAmt)}{" "}
                      <span className="text-muted-foreground">/ {formatCurrency(budgeted)}</span>
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isOver ? "bg-red-500" : pct > 80 ? "bg-mg-amber" : config.color
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className={cn("text-xs", isOver ? "text-red-400" : "text-muted-foreground")}>
                    {isOver
                      ? `Over by ${formatCurrency(Math.abs(remaining))}`
                      : `${formatCurrency(remaining)} left`}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Expense Button / Form */}
          {!showExpenseForm ? (
            <Button
              onClick={() => setShowExpenseForm(true)}
              className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          ) : (
            <Card className="border-mg-pink/30 bg-card">
              <CardContent className="p-4 space-y-4">
                <p className="text-sm font-semibold">Add Expense</p>

                {/* Category chips */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <div className="flex gap-2">
                    {(["NEEDS", "WANTS", "SAVINGS"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setExpCategory(cat);
                          setExpSubcategory("");
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                          expCategory === cat
                            ? `${CATEGORY_CONFIG[cat].color} text-white border-transparent`
                            : "border-border bg-background hover:border-muted-foreground"
                        )}
                      >
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory chips */}
                <div className="space-y-1.5">
                  <Label className="text-xs">What for?</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXPENSE_SUBCATEGORIES[expCategory].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setExpSubcategory(sub)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                          expSubcategory === sub
                            ? "bg-foreground text-background border-transparent"
                            : "border-border bg-background hover:border-muted-foreground"
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                      &#8369;
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="pl-8 bg-background border-border"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Note (optional)</Label>
                  <Input
                    placeholder="e.g. Jollibee with barkada"
                    value={expNote}
                    onChange={(e) => setExpNote(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                {/* Form buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowExpenseForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddExpense}
                    disabled={addingExpense || !expSubcategory || !parseFloat(expAmount)}
                    className="flex-1 bg-mg-pink hover:bg-mg-pink/90 text-white"
                  >
                    {addingExpense ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Expenses */}
          {expenses.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Recent Expenses</p>
              {expenses.map((exp) => {
                const config = CATEGORY_CONFIG[exp.category];
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.dotColor}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{exp.subcategory}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {new Date(exp.date).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                          })}
                          {exp.note ? ` — ${exp.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold">
                        {formatCurrency(exp.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        aria-label={`Delete ${exp.subcategory} expense`}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-2.5 -mr-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleAskAI}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Get AI Advice on My Budget
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
      ) : null}
    </div>
  );
}
