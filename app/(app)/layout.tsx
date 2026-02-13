import { BottomNav } from "@/components/bottom-nav";
import { ChatFab } from "@/components/chat-fab";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <main id="main-content">
        {children}
      </main>

      <ChatFab />
      <BottomNav />
    </div>
  );
}
