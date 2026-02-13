"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMessage } from "@/lib/format-markdown";
import { Send, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  streaming?: boolean;
}

const SUGGESTED_PROMPTS = [
  "How do I start saving?",
  "Paano mag-budget with irregular income?",
  "What's the 50/30/20 rule?",
  "How much tax do content creators pay?",
  "Is this investment a scam?",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("prefill");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(prefill || "");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (data.messages?.length) {
          setMessages(
            data.messages.map((m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "USER" | "ASSISTANT",
              content: m.content,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(messageText?: string) {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "USER",
      content: text,
    };

    const aiMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: aiMsgId, role: "ASSISTANT", content: "", streaming: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error();

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error();

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
                const current = accumulated;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: current, streaming: true }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Finalize
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, streaming: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again!",
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Link href="/dashboard">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mg-pink/20">
            <Sparkles className="h-4 w-4 text-mg-pink" />
          </div>
          <div>
            <p className="text-sm font-semibold">MoneyGlow AI</p>
            <p className="text-xs text-muted-foreground">
              Your financial coach
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-mg-pink" />
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-6 pt-8">
            <div className="text-center space-y-2">
              <Sparkles className="mx-auto h-10 w-10 text-mg-pink" />
              <p className="text-sm text-muted-foreground">
                Hi! I&apos;m MoneyGlow AI. Ask me anything about managing your
                money as a digital creator!
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 text-sm hover:border-mg-pink/50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "USER" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words",
                  msg.role === "USER"
                    ? "bg-mg-pink text-white rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                )}
              >
                {msg.role === "ASSISTANT" ? (
                  msg.content ? (
                    <div
                      className="prose prose-invert prose-sm max-w-none overflow-hidden
                        [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc
                        [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5
                        [&_strong]:text-foreground [&_em]:text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.content),
                      }}
                    />
                  ) : (
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-mg-pink animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-mg-pink animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-mg-pink animate-bounce [animation-delay:300ms]" />
                    </div>
                  )
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask MoneyGlow AI..."
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-mg-pink transition-colors"
            disabled={loading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-mg-pink hover:bg-mg-pink/90 text-white rounded-xl h-auto px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-dvh">
          <Loader2 className="h-8 w-8 animate-spin text-mg-pink" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
