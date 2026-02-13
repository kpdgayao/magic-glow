"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Info } from "lucide-react";

const REFERENCE_RATES = [
  { name: "Maya Savings", rate: "~3%" },
  { name: "Tonik", rate: "~4.5%" },
  { name: "Pag-IBIG MP2", rate: "~6-7%" },
  { name: "FMETF (Index Fund)", rate: "~8-10%" },
];

export default function GrowPage() {
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(6);

  // Compound interest calculation (monthly contributions)
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  const futureValue =
    monthlyRate > 0
      ? monthly *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
      : monthly * totalMonths;
  const totalDeposited = monthly * totalMonths;
  const interestEarned = futureValue - totalDeposited;

  // Chart data — yearly breakdown
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

  const maxTotal = chartData.length > 0 ? chartData[chartData.length - 1].total : 0;

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Grow Your Money
        </h1>
        <p className="text-sm text-muted-foreground">
          See how compound interest works for you
        </p>
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
              <span className="text-sm font-bold text-mg-teal">{rate}%</span>
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

      {/* Chart */}
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
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {d.year}y
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reference Rates */}
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
                <span className="text-xs text-muted-foreground">{r.name}</span>
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
                Even ₱500/month at 6% grows to{" "}
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
  );
}
