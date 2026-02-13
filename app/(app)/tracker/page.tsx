"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Loader2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PLATFORMS, INCOME_TYPES, PLATFORM_COLORS, MONTHS } from "@/lib/constants";

interface IncomeEntry {
  id: string;
  source: string;
  type: string;
  amount: number;
  date: string;
  note?: string;
}

export default function TrackerPage() {
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [source, setSource] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/income?month=${month}&year=${year}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      toast.error("Failed to load income entries");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

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

  async function handleAdd() {
    if (!source || !type || !amount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          type,
          amount: parseFloat(amount),
          date,
          note: note || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Income added! +10 XP");
      resetForm();
      fetchEntries();
    } catch {
      toast.error("Failed to add income");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/income?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  function resetForm() {
    setSource("");
    setType("");
    setAmount("");
    setNote("");
    setShowForm(false);
  }

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  // Group by platform
  const byPlatform = entries.reduce(
    (acc, e) => {
      acc[e.source] = (acc[e.source] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedPlatforms = Object.entries(byPlatform).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="p-4 space-y-5 pb-28">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Income Tracker
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your creator earnings
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} aria-label="Previous month" className="p-2.5 rounded-lg hover:bg-card transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-semibold">{MONTHS[month - 1]} {year}</p>
        <button onClick={nextMonth} aria-label="Next month" className="p-2.5 rounded-lg hover:bg-card transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Monthly Total */}
      <Card className="border-mg-teal/20 bg-mg-teal/5">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {MONTHS[month - 1]} Earnings
          </p>
          <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-mg-teal">
            {formatCurrency(total)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </CardContent>
      </Card>

      {/* By Platform */}
      {sortedPlatforms.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">By Platform</p>
            {sortedPlatforms.map(([platform, amt]) => (
              <div key={platform} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{platform}</span>
                  <span className="font-medium">{formatCurrency(amt)}</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      PLATFORM_COLORS[platform] || "bg-muted-foreground"
                    )}
                    style={{
                      width: `${total > 0 ? (amt / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      <Button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white"
      >
        {showForm ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" /> Hide Form
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" /> Add Income
          </>
        )}
      </Button>

      {/* Add Form */}
      {showForm && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSource(p)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                      source === p
                        ? "bg-mg-pink text-white border-mg-pink"
                        : "bg-background border-border hover:border-muted-foreground"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {INCOME_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                      type === t
                        ? "bg-mg-pink text-white border-mg-pink"
                        : "bg-background border-border hover:border-muted-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₱
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                placeholder="e.g., Collab with @brand"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <Button
              onClick={handleAdd}
              disabled={saving || !source || !type || !amount}
              className="w-full bg-mg-teal hover:bg-mg-teal/90 text-black font-semibold"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-mg-pink" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No income entries for {MONTHS[month - 1]}. Start tracking!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border bg-card">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0",
                      PLATFORM_COLORS[entry.source] || "bg-muted-foreground"
                    )}
                  >
                    {entry.source[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.source} — {entry.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.date)}
                      {entry.note && ` · ${entry.note}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">
                    {formatCurrency(entry.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    aria-label={`Delete ${entry.source} entry`}
                    className="text-muted-foreground hover:text-destructive p-2 -mr-1 transition-colors"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pro Tip */}
      <Card className="border-mg-amber/20 bg-mg-amber/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-mg-amber mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-mg-amber mb-1">Pro Tip</p>
              <p className="text-xs text-muted-foreground">
                Always track your gross income (before fees). This helps you
                calculate your real earnings and prepare for BIR tax filing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
