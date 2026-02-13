import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — MoneyGlow",
  description:
    "Financial literacy tips for young Filipino digital creators. Learn about budgeting, taxes, saving, and growing your creator income.",
  openGraph: {
    title: "Blog — MoneyGlow",
    description:
      "Financial literacy tips for young Filipino digital creators. Learn about budgeting, taxes, saving, and growing your creator income.",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-serif text-foreground">
          MoneyGlow Blog
        </h1>
        <p className="mt-2 text-muted-foreground">
          Financial literacy tips and guides for young Filipino digital
          creators.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-mg-pink/50"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0">{post.coverEmoji}</span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-mg-pink transition-colors">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
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
                      <span
                        key={tag}
                        className="bg-muted px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
