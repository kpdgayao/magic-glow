import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const QUIZ_RESULTS: Record<
  string,
  { title: string; emoji: string; color: string; desc: string; tip: string }
> = {
  YOLO: {
    title: "The YOLO Spender",
    emoji: "\u{1F483}",
    color: "#FF6B9D",
    desc: "You live for the moment! That's fun, but your future self might not agree. Time to build some money habits that let you enjoy NOW while securing LATER.",
    tip: "Start with one small step: save \u20B1100 every time you earn from content.",
  },
  CHILL: {
    title: "The Chill Saver",
    emoji: "\u{1F60E}",
    color: "#FFB86C",
    desc: "You have basic money awareness but no real system. You're halfway there! A little structure will take you from 'okay' to 'thriving.'",
    tip: "Try the 50/30/20 rule this month. Use the Budget tab!",
  },
  PLAN: {
    title: "The Planner",
    emoji: "\u{1F4CB}",
    color: "#6C9CFF",
    desc: "You think ahead and make smart choices. You're already ahead of most people your age. Now level up to automate and optimize.",
    tip: "Explore compound interest in the Insights tab \u2014 see how your savings multiply!",
  },
  MASTER: {
    title: "The Money Master",
    emoji: "\u{1F451}",
    color: "#50E3C2",
    desc: "You're financially savvy! You track, plan, and protect your money like a pro. Keep going and help your friends level up too.",
    tip: "Consider MP2, mutual funds, or digital banks with higher interest.",
  },
};

const VALID_TYPES = ["YOLO", "CHILL", "PLAN", "MASTER"];

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const upperType = type.toUpperCase();
  const data = QUIZ_RESULTS[upperType];
  if (!data) return { title: "Quiz Result | MoneyGlow" };

  const title = `I'm ${data.title}! | MoneyGlow Quiz`;
  const description = `${data.desc} Take the MoneyGlow Money Personality Quiz to find out yours!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://moneyglow.app/share/quiz/${upperType}`,
      siteName: "MoneyGlow",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function QuizSharePage({ params }: Props) {
  const { type } = await params;
  const upperType = type.toUpperCase();
  const data = QUIZ_RESULTS[upperType];

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {/* Result card */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <span className="text-7xl block">{data.emoji}</span>
        <h1
          className="font-serif text-3xl font-bold"
          style={{ color: data.color }}
        >
          {data.title}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {data.desc}
        </p>

        {/* Tip */}
        <div
          className="rounded-xl p-4 text-left"
          style={{ backgroundColor: data.color + "10", borderColor: data.color + "30", borderWidth: 1 }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: data.color }}>
            Your Next Step
          </p>
          <p className="text-sm text-muted-foreground">{data.tip}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 space-y-4">
        <p className="text-muted-foreground text-sm">
          What&apos;s your money personality?
        </p>
        <Link
          href="/login"
          className="inline-block bg-mg-pink text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          Take the Quiz
        </Link>
        <p className="text-xs text-muted-foreground/60">
          Free &middot; No password needed &middot; Takes 2 minutes
        </p>
      </div>
    </div>
  );
}
