"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

const REASON_CHIPS = [
  "Confusing",
  "Too slow",
  "Bug",
  "Missing feature",
  "Other",
];

const COOLDOWN_KEY = "mg_feedback_last";
const DISMISS_KEY = "mg_feedback_dismissals";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_DISMISSALS = 3;
const DISMISS_BLOCK_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface FeedbackCardProps {
  context: string;
  page: string;
  question?: string;
}

export function shouldShowFeedback(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const lastShown = localStorage.getItem(COOLDOWN_KEY);
    if (lastShown) {
      const elapsed = Date.now() - parseInt(lastShown);
      if (elapsed < COOLDOWN_MS) return false;
    }
    const dismissals = parseInt(localStorage.getItem(DISMISS_KEY) || "0");
    if (dismissals >= MAX_DISMISSALS) {
      const lastDismiss = localStorage.getItem(COOLDOWN_KEY);
      if (lastDismiss && Date.now() - parseInt(lastDismiss) < DISMISS_BLOCK_MS) {
        return false;
      }
      // Reset after 30-day block
      localStorage.setItem(DISMISS_KEY, "0");
    }
    return true;
  } catch {
    return false;
  }
}

function recordShown() {
  try {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
  } catch {}
}

function recordDismissal() {
  try {
    const count = parseInt(localStorage.getItem(DISMISS_KEY) || "0");
    localStorage.setItem(DISMISS_KEY, (count + 1).toString());
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
  } catch {}
}

function resetDismissals() {
  try {
    localStorage.setItem(DISMISS_KEY, "0");
  } catch {}
}

export function FeedbackCard({
  context,
  page,
  question = "How's your experience?",
}: FeedbackCardProps) {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState<"rate" | "reason" | "done">("rate");
  const [rating, setRating] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [customText, setCustomText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!visible || step === "done") return null;

  async function submitFeedback(r: number, reasonText?: string) {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: r,
          reason: reasonText || null,
          context,
          page,
        }),
      });
      resetDismissals();
      recordShown();
      setStep("done");
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Could not save feedback");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEmoji(r: number) {
    setRating(r);
    if (r === 1) {
      // Positive — submit immediately
      submitFeedback(1);
    } else {
      // Negative or neutral — show reason step
      setStep("reason");
    }
  }

  function handleDismiss() {
    recordDismissal();
    setVisible(false);
  }

  function handleSubmitReason() {
    const finalReason = reason === "Other" ? customText || "Other" : reason;
    submitFeedback(rating!, finalReason);
  }

  recordShown();

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        {step === "rate" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{question}</p>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleEmoji(-1)}
                className="text-3xl hover:scale-110 transition-transform p-2"
                aria-label="Not great"
              >
                😟
              </button>
              <button
                onClick={() => handleEmoji(0)}
                className="text-3xl hover:scale-110 transition-transform p-2"
                aria-label="Okay"
              >
                😐
              </button>
              <button
                onClick={() => handleEmoji(1)}
                className="text-3xl hover:scale-110 transition-transform p-2"
                aria-label="Great"
              >
                😊
              </button>
            </div>
          </div>
        )}

        {step === "reason" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">What could be better?</p>
            <div className="flex flex-wrap gap-2">
              {REASON_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setReason(chip)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    reason === chip
                      ? "bg-mg-pink text-white border-mg-pink"
                      : "bg-background border-border hover:border-muted-foreground"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            {reason === "Other" && (
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Tell us more..."
                maxLength={200}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-mg-pink"
              />
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReason}
                disabled={!reason || submitting}
                size="sm"
                className="bg-mg-pink hover:bg-mg-pink/90 text-white"
              >
                Submit
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Skip
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AdviceFeedbackProps {
  context?: string;
}

export function AdviceFeedback({ context = "advice" }: AdviceFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleVote(rating: number) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          context,
          page: "/advice",
        }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail — don't disrupt the advice experience
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-xs text-muted-foreground text-center mt-3">
        Thanks for your feedback!
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-3">
      <span className="text-xs text-muted-foreground">Was this helpful?</span>
      <button
        onClick={() => handleVote(1)}
        disabled={submitting}
        className="text-lg hover:scale-110 transition-transform p-1"
        aria-label="Helpful"
      >
        👍
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={submitting}
        className="text-lg hover:scale-110 transition-transform p-1"
        aria-label="Not helpful"
      >
        👎
      </button>
    </div>
  );
}
