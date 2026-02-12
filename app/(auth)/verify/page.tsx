"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Suspense } from "react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No token provided");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");

        // Redirect based on onboarding status
        setTimeout(() => {
          router.push(data.redirectTo || "/dashboard");
        }, 1500);
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-mg-pink">
          MoneyGlow
        </h1>
      </div>

      <div className="space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-mg-pink" />
            <p className="text-muted-foreground">Verifying your link...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-mg-teal" />
            <p className="text-foreground font-medium">
              You&apos;re in! Redirecting...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground">
              This link may have expired or already been used.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-mg-pink hover:underline"
            >
              Request a new link
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center space-y-6">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-mg-pink" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
