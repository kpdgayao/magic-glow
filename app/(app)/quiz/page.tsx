"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { QUIZ_QUESTIONS, type QuizResultType } from "@/lib/quiz-data";

export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<QuizResultType[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const question = QUIZ_QUESTIONS[current];
  const total = QUIZ_QUESTIONS.length;

  function handleSelect(index: number) {
    setSelected(index);

    // Auto-advance after short delay
    setTimeout(() => {
      const newAnswers = [...answers, question.options[index].type];
      setAnswers(newAnswers);
      setSelected(null);

      if (current + 1 < total) {
        setCurrent(current + 1);
      } else {
        // Calculate result
        const counts: Record<string, number> = {};
        newAnswers.forEach((a) => {
          counts[a] = (counts[a] || 0) + 1;
        });
        const result = Object.entries(counts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        // Navigate to result page with result in URL
        router.push(`/quiz/result?r=${result}`);
      }
    }, 400);
  }

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Money Personality Quiz
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover your money style in 5 questions
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question {current + 1} of {total}
          </span>
          <span>{Math.round(((current + 1) / total) * 100)}%</span>
        </div>
        <Progress value={((current + 1) / total) * 100} className="h-2" />
      </div>

      {/* Question */}
      <p className="text-lg font-semibold leading-relaxed">{question.q}</p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
            className={cn(
              "w-full text-left rounded-xl border p-4 transition-all",
              selected === i
                ? "bg-mg-pink border-mg-pink text-white scale-[0.98]"
                : "bg-card border-border hover:border-muted-foreground"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  selected === i
                    ? "bg-white/20 text-white"
                    : "bg-background text-muted-foreground"
                )}
              >
                {letters[i]}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
