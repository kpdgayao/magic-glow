"use client";

import { useState } from "react";
import { Share2, Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  variant?: "button" | "icon";
  className?: string;
  utmSource?: string;
}

function buildShareUrl(url: string, utmSource?: string): string {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://moneyglow.app";
    const fullUrl = new URL(url, base);
    if (utmSource) {
      fullUrl.searchParams.set("utm_source", utmSource);
      fullUrl.searchParams.set("utm_medium", "social");
      fullUrl.searchParams.set("utm_campaign", "share");
    }
    return fullUrl.toString();
  } catch {
    return url;
  }
}

export function ShareButton({
  title,
  text,
  url,
  variant = "button",
  className,
  utmSource,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = buildShareUrl(url, utmSource);
    const shareData = { title, text, url: shareUrl };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    await copyToClipboard(shareUrl);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        className={`flex items-center justify-center h-11 w-11 rounded-lg border border-border bg-card hover:border-muted-foreground transition-colors ${className || ""}`}
        aria-label="Share"
      >
        {copied ? (
          <Check className="h-4 w-4 text-mg-teal" />
        ) : (
          <Share2 className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={`gap-2 ${className || ""}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-mg-teal" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
