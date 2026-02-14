import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "MoneyGlow — Financial Literacy for Filipino Creators",
  description:
    "Budget, save, track income, and get AI-powered financial advice — built for young Filipino digital creators.",
  openGraph: {
    title: "MoneyGlow — Financial Literacy for Filipino Creators",
    description:
      "Budget, save, track income, and get AI-powered financial advice — built for young Filipino digital creators.",
    type: "website",
  },
};

const FEATURES = [
  {
    emoji: "💰",
    title: "Income Tracker",
    desc: "Log earnings from TikTok, YouTube, brand deals, and more — by platform and type.",
  },
  {
    emoji: "📋",
    title: "Smart Budget",
    desc: "50/30/20 budgeting with expense tracking, category breakdowns, and over-budget alerts.",
  },
  {
    emoji: "💡",
    title: "Daily AI Advice",
    desc: "Personalized money tips from an AI coach that knows the Filipino creator economy.",
  },
  {
    emoji: "📊",
    title: "Insights & Tools",
    desc: "Compound interest calculator, tax estimator, and income vs expense trends.",
  },
  {
    emoji: "🎯",
    title: "Money Quiz",
    desc: "Discover your money personality and get a custom 30-day financial challenge.",
  },
  {
    emoji: "💬",
    title: "AI Chat",
    desc: "Ask anything about budgeting, taxes, saving, or growing your creator income.",
  },
];

export default async function Home() {
  const session = await getSession();
  const posts = getAllPosts().slice(0, 4);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold font-serif text-mg-pink">
            MoneyGlow
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium bg-mg-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium bg-mg-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold font-serif leading-tight">
          Your Financial{" "}
          <span className="text-mg-pink">Glow-Up</span>{" "}
          Starts Here
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          The financial literacy app built for young Filipino digital creators.
          Budget smarter, track your income, and get AI-powered money advice.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="bg-mg-pink text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            {session ? "Go to Dashboard" : "Get Started Free"}
          </Link>
          <Link
            href="/blog"
            className="border border-border text-foreground font-medium px-6 py-3 rounded-xl hover:bg-card transition-colors"
          >
            Read the Blog
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold font-serif text-center mb-10">
          Everything you need to manage your creator money
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Preview */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold font-serif">From the Blog</h2>
          <Link
            href="/blog"
            className="text-sm text-mg-pink hover:underline"
          >
            View all posts
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-mg-pink/50"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{post.coverEmoji}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-mg-pink transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <time
                    dateTime={post.date}
                    className="mt-2 block text-xs text-muted-foreground"
                  >
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <h2 className="text-2xl font-bold font-serif">
            Ready to glow up your finances?
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Join Filipino creators who are taking control of their money —
            no password needed, just your email.
          </p>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="mt-6 inline-block bg-mg-pink text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            {session ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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
          <div className="flex gap-4">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
