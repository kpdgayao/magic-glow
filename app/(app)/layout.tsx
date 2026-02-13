import { BottomNav } from "@/components/bottom-nav";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {children}

      {/* Floating chat button */}
      <Link
        href="/chat"
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-mg-pink text-white shadow-lg shadow-mg-pink/25 transition-transform hover:scale-105 active:scale-95 right-4"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        aria-label="Ask MoneyGlow AI"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>

      <BottomNav />
    </div>
  );
}
