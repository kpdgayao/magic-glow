"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface FeedbackEntry {
  id: string;
  rating: number;
  reason: string | null;
  context: string | null;
  page: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
}

interface FeedbackData {
  feedback: FeedbackEntry[];
  total: number;
  page: number;
  totalPages: number;
  stats: { positive: number; neutral: number; negative: number };
}

const RATING_LABELS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😊", label: "Positive", color: "text-mg-teal" },
  0: { emoji: "😐", label: "Neutral", color: "text-mg-amber" },
  [-1]: { emoji: "😟", label: "Negative", color: "text-mg-pink" },
};

export default function AdminFeedbackPage() {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/feedback?page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-mg-pink" />
      </div>
    );
  }

  if (!data) return null;

  const total = data.stats.positive + data.stats.neutral + data.stats.negative;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} total responses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-mg-teal/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl">😊</p>
            <p className="text-2xl font-bold text-mg-teal">
              {data.stats.positive}
            </p>
            <p className="text-xs text-muted-foreground">
              Positive{total > 0 && ` (${Math.round((data.stats.positive / total) * 100)}%)`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-mg-amber/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl">😐</p>
            <p className="text-2xl font-bold text-mg-amber">
              {data.stats.neutral}
            </p>
            <p className="text-xs text-muted-foreground">
              Neutral{total > 0 && ` (${Math.round((data.stats.neutral / total) * 100)}%)`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-mg-pink/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl">😟</p>
            <p className="text-2xl font-bold text-mg-pink">
              {data.stats.negative}
            </p>
            <p className="text-xs text-muted-foreground">
              Negative{total > 0 && ` (${Math.round((data.stats.negative / total) * 100)}%)`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback list */}
      {data.feedback.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No feedback yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.feedback.map((entry) => {
            const info = RATING_LABELS[entry.rating] || RATING_LABELS[0];
            return (
              <Card key={entry.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{info.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {entry.user.name || entry.user.email}
                          </span>
                          <span className={`text-xs font-medium ${info.color}`}>
                            {info.label}
                          </span>
                          {entry.context && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-md">
                              {entry.context}
                            </span>
                          )}
                        </div>
                        {entry.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.reason}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/60">
                          <time>
                            {new Date(entry.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                          {entry.page && <span>{entry.page}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
