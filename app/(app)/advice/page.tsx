"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMessage } from "@/lib/format-markdown";
import { Sparkles, Flame, Trophy, Loader2 } from "lucide-react";

interface StatsData {
  xp: number;
  level: number;
  levelName: string;
  levelEmoji: string;
  nextLevel: {
    level: number;
    name: string;
    emoji: string;
    xpNeeded: number;
    progress: number;
  } | null;
  streakCount: number;
  longestStreak: number;
  glowScore: number;
  glowLabel: string;
  glowEmoji: string;
}

export default function AdvicePage() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Fetch stats in parallel
      fetch("/api/user/stats")
        .then((res) => res.json())
        .then(setStats)
        .catch(() => {});

      try {
        const res = await fetch("/api/advice");
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("text/event-stream")) {
          // Streaming new advice
          setLoading(false);
          setStreaming(true);
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          if (!reader) return;

          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    accumulated += parsed.text;
                    setAdvice(accumulated);
                  }
                } catch {
                  // Skip
                }
              }
            }
          }

          setStreaming(false);
          // Refresh stats after XP award
          fetch("/api/user/stats")
            .then((res) => res.json())
            .then(setStats)
            .catch(() => {});
        } else {
          // Cached JSON response
          const data = await res.json();
          setAdvice(data.advice || null);
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-mg-pink mx-auto" />
          <p className="text-sm text-muted-foreground">
            Getting your daily advice...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Daily Advice
        </h1>
        <p className="text-sm text-muted-foreground">
          Your personalized money tip for today
        </p>
      </div>

      {/* Today's Advice */}
      <Card className="border-mg-pink/20 bg-mg-pink/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-mg-pink mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-mg-pink mb-2">
                Today&apos;s Money Tip
              </p>
              {advice ? (
                <div
                  className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
                    [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5
                    [&_strong]:text-foreground [&_em]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(advice),
                  }}
                />
              ) : (
                <p className="text-sm leading-relaxed">
                  Come back tomorrow for a new tip!
                </p>
              )}
              {streaming && (
                <span className="inline-block w-1.5 h-4 bg-mg-pink animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      {stats && (
        <Card className="border-mg-amber/20 bg-mg-amber/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-mg-amber" />
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-mg-amber">
                    {stats.streakCount} day{stats.streakCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{stats.longestStreak}</p>
                <p className="text-[10px] text-muted-foreground">Best streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Glow Score */}
      {stats && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Glow Score</p>
              <span className="text-lg">
                {stats.glowEmoji} {stats.glowScore}/100
              </span>
            </div>
            <Progress value={stats.glowScore} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {stats.glowLabel} — Track income, save budgets, and check in daily
              to boost your glow!
            </p>
          </CardContent>
        </Card>
      )}

      {/* XP & Level */}
      {stats && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-mg-teal" />
                <p className="text-sm font-medium">Level {stats.level}</p>
              </div>
              <span className="text-sm">
                {stats.levelEmoji} {stats.levelName}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.xp} XP earned
            </div>
            {stats.nextLevel && (
              <>
                <Progress value={stats.nextLevel.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.nextLevel.xpNeeded} XP to {stats.nextLevel.emoji}{" "}
                  {stats.nextLevel.name}
                </p>
              </>
            )}
            {!stats.nextLevel && (
              <p className="text-xs text-mg-teal">
                Max level reached! You&apos;re a Money Master!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* How to Earn XP */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium mb-1">How to Earn XP</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Get daily advice</span>
              <span className="font-medium text-mg-pink">+20 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Complete quiz</span>
              <span className="font-medium text-mg-pink">+25 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Save a budget</span>
              <span className="font-medium text-mg-pink">+15 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Log income</span>
              <span className="font-medium text-mg-pink">+10 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Log expense</span>
              <span className="font-medium text-mg-pink">+5 XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
