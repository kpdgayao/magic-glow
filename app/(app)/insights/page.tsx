"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Info,
  Loader2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────

interface MonthSummary {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

// ─── Tax constants (TRAIN Law RA 10963, 2023+ brackets) ─────

const GRADUATED_BRACKETS = [
  { min: 0, max: 250_000, rate: 0, base: 0 },
  { min: 250_000, max: 400_000, rate: 0.15, base: 0 },
  { min: 400_000, max: 800_000, rate: 0.2, base: 22_500 },
  { min: 800_000, max: 2_000_000, rate: 0.25, base: 102_500 },
  { min: 2_000_000, max: 8_000_000, rate: 0.3, base: 402_500 },
  { min: 8_000_000, max: Infinity, rate: 0.35, base: 2_202_500 },
];

const OSD_RATE = 0.4; // 40% Optional Standard Deduction
const PERCENTAGE_TAX_RATE = 0.03; // 3% quarterly percentage tax (restored July 2023)

/** Graduated income tax on taxable income (after deductions) */
function calcGraduatedIncomeTax(taxableIncome: number): number {
  for (let i = GRADUATED_BRACKETS.length - 1; i >= 0; i--) {
    const b = GRADUATED_BRACKETS[i];
    if (taxableIncome > b.min) {
      return b.base + (taxableIncome - b.min) * b.rate;
    }
  }
  return 0;
}

/**
 * Graduated option total tax (for self-employed/freelancers):
 * = Graduated income tax on (Gross - 40% OSD) + 3% percentage tax on Gross
 */
function calcGraduatedTotal(gross: number) {
  const taxableIncome = gross * (1 - OSD_RATE); // Gross minus 40% OSD
  const incomeTax = calcGraduatedIncomeTax(taxableIncome);
  const percentageTax = gross * PERCENTAGE_TAX_RATE;
  return { incomeTax, percentageTax, taxableIncome, total: incomeTax + percentageTax };
}

/**
 * 8% flat tax option (for self-employed/freelancers under ₱3M):
 * = 8% of (Gross - ₱250K)
 * Replaces BOTH graduated income tax AND 3% percentage tax.
 */
function calcFlat8(gross: number): number {
  if (gross > 3_000_000) return Infinity; // not eligible above VAT threshold
  return Math.max(0, (gross - 250_000) * 0.08);
}

// ─── Reference rates (shared with compound section) ──────────

const REFERENCE_RATES = [
  { name: "Maya Savings", rate: "~3%" },
  { name: "Tonik", rate: "~4.5%" },
  { name: "Pag-IBIG MP2", rate: "~6-7%" },
  { name: "FMETF (Index Fund)", rate: "~8-10%" },
];

const TAX_PRESETS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000];

// ─── Page ─────────────────────────────────────────────────────

export default function InsightsPage() {
  // Trends state
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // Compound state
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(6);

  // Tax state
  const [annualGross, setAnnualGross] = useState(250_000);

  useEffect(() => {
    fetch("/api/insights/monthly-summary")
      .then((res) => res.json())
      .then((data) => setMonths(data.months || []))
      .catch(() => toast.error("Failed to load trends"))
      .finally(() => setTrendsLoading(false));
  }, []);

  // ── Compound calculations ──
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  const futureValue =
    monthlyRate > 0
      ? monthly *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
      : monthly * totalMonths;
  const totalDeposited = monthly * totalMonths;
  const interestEarned = futureValue - totalDeposited;

  const chartData = Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const m = y * 12;
    const fv =
      monthlyRate > 0
        ? monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate)
        : monthly * m;
    const dep = monthly * m;
    return { year: y, deposited: dep, interest: fv - dep, total: fv };
  });

  const maxTotal =
    chartData.length > 0 ? chartData[chartData.length - 1].total : 0;

  // ── Tax calculations ──
  const flat8Tax = calcFlat8(annualGross);
  const graduated = calcGraduatedTotal(annualGross);
  const flat8Eligible = annualGross <= 3_000_000;
  const recommended =
    flat8Eligible && flat8Tax <= graduated.total ? "flat8" : "graduated";

  // ── Trends chart helpers ──
  const hasData = months.some((m) => m.income > 0 || m.expenses > 0);
  const maxBar = Math.max(...months.map((m) => Math.max(m.income, m.expenses)), 1);
  const currentMonth = months.length > 0 ? months[months.length - 1] : null;

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Trends, tools &amp; tax estimator
        </p>
      </div>

      {/* ═══════════ SECTION 1: Income vs Expenses ═══════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-mg-teal" />
          <p className="text-sm font-medium">Income vs Expenses</p>
        </div>

        {trendsLoading ? (
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-mg-pink" />
            </CardContent>
          </Card>
        ) : !hasData ? (
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Start tracking income and expenses to see your trends
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-mg-teal" />
                    Income
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-mg-pink" />
                    Expenses
                  </div>
                </div>

                {/* Bar chart */}
                <div className="flex items-end gap-2 h-36">
                  {months.map((m) => (
                    <div
                      key={`${m.year}-${m.month}`}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                    >
                      <div className="flex items-end gap-0.5 w-full justify-center h-full">
                        {/* Income bar */}
                        <div
                          className="bg-mg-teal rounded-t flex-1 max-w-3 transition-all"
                          style={{
                            height: `${(m.income / maxBar) * 100}%`,
                            minHeight: m.income > 0 ? "4px" : "0",
                          }}
                        />
                        {/* Expense bar */}
                        <div
                          className="bg-mg-pink rounded-t flex-1 max-w-3 transition-all"
                          style={{
                            height: `${(m.expenses / maxBar) * 100}%`,
                            minHeight: m.expenses > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current month net */}
            {currentMonth && (
              <Card
                className={
                  currentMonth.net >= 0
                    ? "border-mg-teal/20 bg-mg-teal/5"
                    : "border-destructive/20 bg-destructive/5"
                }
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {currentMonth.label} net
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      currentMonth.net >= 0
                        ? "text-mg-teal"
                        : "text-destructive"
                    }`}
                  >
                    {currentMonth.net >= 0 ? "+" : ""}
                    {formatCurrency(currentMonth.net)}
                  </span>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* ═══════════ SECTION 2: Compound Interest ═══════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-mg-amber" />
          <p className="text-sm font-medium">Compound Interest Calculator</p>
        </div>

        {/* Controls */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Monthly Savings</Label>
                <span className="text-sm font-bold text-mg-pink">
                  {formatCurrency(monthly)}
                </span>
              </div>
              <Slider
                value={[monthly]}
                onValueChange={([v]) => setMonthly(v)}
                min={100}
                max={50000}
                step={500}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Years</Label>
                <span className="text-sm font-bold text-mg-amber">
                  {years} {years === 1 ? "year" : "years"}
                </span>
              </div>
              <Slider
                value={[years]}
                onValueChange={([v]) => setYears(v)}
                min={1}
                max={30}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Interest Rate</Label>
                <span className="text-sm font-bold text-mg-teal">
                  {rate}%
                </span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={([v]) => setRate(v)}
                min={1}
                max={15}
                step={0.5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="border-mg-teal/20 bg-mg-teal/5">
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              After {years} {years === 1 ? "year" : "years"}, you&apos;ll have
            </p>
            <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-mg-teal">
              {formatCurrency(futureValue)}
            </p>
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-mg-blue mr-1" />
                Deposited: {formatCurrency(totalDeposited)}
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-mg-amber mr-1" />
                Interest: {formatCurrency(interestEarned)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth chart */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-4">Growth Over Time</p>
            <div className="flex items-end gap-1 h-40">
              {chartData.map((d) => (
                <div
                  key={d.year}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  <div
                    className="w-full flex flex-col justify-end rounded-t"
                    style={{
                      height: `${(d.total / maxTotal) * 100}%`,
                    }}
                  >
                    <div
                      className="bg-mg-amber rounded-t"
                      style={{
                        height: `${(d.interest / d.total) * 100}%`,
                        minHeight: d.interest > 0 ? "2px" : "0",
                      }}
                    />
                    <div
                      className="bg-mg-blue"
                      style={{
                        height: `${(d.deposited / d.total) * 100}%`,
                        minHeight: "2px",
                      }}
                    />
                  </div>
                  {(d.year === 1 ||
                    d.year === years ||
                    d.year % Math.max(1, Math.floor(years / 5)) === 0) && (
                    <span className="text-[11px] text-muted-foreground mt-1">
                      {d.year}y
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reference rates */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">PH Reference Rates</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {REFERENCE_RATES.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {r.name}
                  </span>
                  <span className="text-xs font-semibold">{r.rate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tip */}
        <Card className="border-mg-amber/20 bg-mg-amber/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-mg-amber mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-mg-amber mb-1">
                  Start Early
                </p>
                <p className="text-xs text-muted-foreground">
                  Even {formatCurrency(500)}/month at 6% grows to{" "}
                  {formatCurrency(
                    500 *
                      ((Math.pow(1 + 0.06 / 12, 120) - 1) / (0.06 / 12))
                  )}{" "}
                  in 10 years. Time is your best investment!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ SECTION 3: Tax Estimator ═══════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-mg-blue" />
          <p className="text-sm font-medium">Tax Estimator</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Annual Gross Income</Label>
                <span className="text-sm font-bold text-mg-blue">
                  {formatCurrency(annualGross)}
                </span>
              </div>
              <Slider
                value={[annualGross]}
                onValueChange={([v]) => setAnnualGross(v)}
                min={50_000}
                max={5_000_000}
                step={10_000}
              />
              <div className="flex flex-wrap gap-1.5">
                {TAX_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnnualGross(p)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      annualGross === p
                        ? "bg-mg-blue text-white border-mg-blue"
                        : "bg-background border-border hover:border-muted-foreground"
                    }`}
                  >
                    {formatCurrency(p)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* 8% Flat */}
          <Card
            className={
              recommended === "flat8"
                ? "border-mg-teal/40 bg-mg-teal/5"
                : "border-border bg-card"
            }
          >
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">8% Flat</p>
                {recommended === "flat8" && (
                  <span className="text-[11px] text-mg-teal font-semibold">
                    BETTER
                  </span>
                )}
              </div>
              {flat8Eligible ? (
                <>
                  <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-mg-teal">
                    {formatCurrency(flat8Tax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {((flat8Tax / annualGross) * 100).toFixed(1)}% effective
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatCurrency(flat8Tax / 12)}/mo
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    Replaces income tax + percentage tax
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Not eligible (&gt;{formatCurrency(3_000_000)})
                </p>
              )}
            </CardContent>
          </Card>

          {/* Graduated + OSD */}
          <Card
            className={
              recommended === "graduated"
                ? "border-mg-teal/40 bg-mg-teal/5"
                : "border-border bg-card"
            }
          >
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Graduated + OSD</p>
                {recommended === "graduated" && (
                  <span className="text-[11px] text-mg-teal font-semibold">
                    BETTER
                  </span>
                )}
              </div>
              <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-mg-blue">
                {formatCurrency(graduated.total)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {((graduated.total / annualGross) * 100).toFixed(1)}% effective
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatCurrency(graduated.total / 12)}/mo
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Income tax {formatCurrency(graduated.incomeTax)} + 3% tax {formatCurrency(graduated.percentageTax)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings comparison */}
        {flat8Eligible && (
          <Card
            className={
              recommended === "flat8"
                ? "border-mg-teal/20 bg-mg-teal/5"
                : "border-mg-blue/20 bg-mg-blue/5"
            }
          >
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">
                {recommended === "flat8"
                  ? `8% flat saves you ${formatCurrency(graduated.total - flat8Tax)}/year vs graduated`
                  : `Graduated + OSD saves you ${formatCurrency(flat8Tax - graduated.total)}/year vs 8% flat`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-medium">How this works</p>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-start justify-between gap-2">
                <span>Gross income</span>
                <span className="font-medium text-foreground shrink-0">{formatCurrency(annualGross)}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span>40% OSD (deduction)</span>
                <span className="shrink-0">-{formatCurrency(annualGross * OSD_RATE)}</span>
              </div>
              <div className="flex items-start justify-between gap-2 border-t border-border pt-1.5">
                <span>Taxable income (graduated)</span>
                <span className="font-medium text-foreground shrink-0">{formatCurrency(graduated.taxableIncome)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-mg-blue/20 bg-mg-blue/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-mg-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-mg-blue mb-1">
                  For Estimation Only
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on the TRAIN Law (RA 10963) brackets for self-employed/freelancers.
                  Uses 40% Optional Standard Deduction (OSD) for graduated rates.
                  The 8% flat rate replaces both income tax and 3% percentage tax.
                  Actual taxes depend on your deductions, BIR filings, and specific situation.
                  Consult a CPA for tax advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
