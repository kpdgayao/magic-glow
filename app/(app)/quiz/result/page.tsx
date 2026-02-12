"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QUIZ_RESULTS, type QuizResultType } from "@/lib/quiz-data";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";

function QuizResultContent() {
  const searchParams = useSearchParams();
  const resultParam = searchParams.get("r") as QuizResultType | null;
  const [challenge, setChallenge] = useState<string | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [saved, setSaved] = useState(false);

  const result = resultParam && QUIZ_RESULTS[resultParam] ? resultParam : null;
  const data = result ? QUIZ_RESULTS[result] : null;

  useEffect(() => {
    if (result && !saved) {
      // Save result to DB only (no AI call)
      fetch(`/api/quiz/result?action=save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      })
        .then((res) => res.json())
        .then(() => setSaved(true))
        .catch(() => {});
    }
  }, [result, saved]);

  async function handleGetChallenge() {
    if (!result) return;
    setLoadingChallenge(true);
    try {
      const res = await fetch("/api/quiz/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();
      if (data.challenge) {
        setChallenge(data.challenge);
      } else if (data.error) {
        setChallenge(`*Could not generate challenge: ${data.error}*`);
      }
    } catch {
      setChallenge("*Could not generate challenge. Please try again later.*");
    } finally {
      setLoadingChallenge(false);
    }
  }

  if (!data) {
    return (
      <div className="p-4 pt-8 text-center">
        <p className="text-muted-foreground">Invalid quiz result.</p>
        <Link href="/quiz" className="text-mg-pink hover:underline text-sm">
          Take the quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2 text-center space-y-4">
        <span className="text-6xl">{data.emoji}</span>
        <h1
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
          style={{ color: data.color }}
        >
          {data.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.desc}
        </p>
      </div>

      {/* Tip Card */}
      <Card
        className="border-border bg-card"
        style={{ borderColor: data.color + "33" }}
      >
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-1" style={{ color: data.color }}>
            Your Next Step
          </p>
          <p className="text-sm text-muted-foreground">{data.tip}</p>
        </CardContent>
      </Card>

      {/* 30-Day Challenge */}
      {challenge ? (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-mg-pink mb-3">
              Your 30-Day Money Challenge
            </p>
            <div
              className="text-sm text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none
                [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground
                [&_strong]:text-foreground [&_li]:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(challenge) }}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleGetChallenge}
          disabled={loadingChallenge}
          className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white"
        >
          {loadingChallenge ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Get Your 30-Day Challenge
        </Button>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/quiz" className="flex-1">
          <Button variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </Link>
        <Link href="/chat" className="flex-1">
          <Button className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white">
            Chat about it
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Simple markdown to HTML (bold, lists, headings)
function formatMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function QuizResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-mg-pink" />
        </div>
      }
    >
      <QuizResultContent />
    </Suspense>
  );
}
