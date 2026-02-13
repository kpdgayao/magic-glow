import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, renderMarkdown } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} — MoneyGlow`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.date,
        tags: post.tags,
      },
    };
  } catch {
    return { title: "Post Not Found — MoneyGlow" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const html = renderMarkdown(post.content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      {/* Post header */}
      <header className="mb-8">
        <span className="text-5xl block mb-4">{post.coverEmoji}</span>
        <h1 className="text-3xl font-bold font-serif text-foreground leading-tight">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className="text-border">|</span>
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-muted px-2 py-0.5 rounded-md text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Post body */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-bold font-serif text-foreground">
          Ready to start your financial glow-up?
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Track your income, budget smarter, and get personalized AI financial
          advice — all built for Filipino creators.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block bg-mg-pink text-white font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Get Started Free
        </Link>
      </div>
    </article>
  );
}
