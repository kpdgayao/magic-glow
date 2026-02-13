"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-mg-pink">
            MoneyGlow
          </h1>
          <p className="text-sm text-muted-foreground">
            Your Financial Glow-Up Starts Here
          </p>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="pt-6 space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-mg-teal" />
            <h2 className="text-xl font-semibold">Check your email!</h2>
            <p className="text-sm text-muted-foreground">
              We sent a sign-in link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              The link expires in 15 minutes. Check your spam folder if you
              don&apos;t see it.
            </p>
            <Button
              variant="ghost"
              className="text-mg-pink"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-mg-pink">
          MoneyGlow
        </h1>
        <p className="text-sm text-muted-foreground">
          Your Financial Glow-Up Starts Here
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background border-border"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-mg-pink hover:bg-mg-pink/90 text-white font-semibold"
              disabled={loading || !email}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Magic Link
            </Button>

            <p className="text-xs text-muted-foreground">
              We&apos;ll send you a sign-in link — no password needed!
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://www.iol.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mg-pink hover:underline"
          >
            IOL Inc.
          </a>
        </p>
      </div>
    </div>
  );
}
