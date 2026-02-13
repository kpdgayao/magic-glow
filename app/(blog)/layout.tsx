import Link from "next/link";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-serif text-mg-pink">
              MoneyGlow
            </span>
            <span className="text-muted-foreground text-sm hidden sm:inline">
              Blog
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All Posts
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-mg-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
          <p>
            MoneyGlow — Powered by{" "}
            <a
              href="https://www.iol.ph"
              className="text-mg-pink hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              IOL Inc.
            </a>
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} MoneyGlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
