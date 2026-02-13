import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverEmoji: string;
  content: string; // raw markdown
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    tags: data.tags || [],
    coverEmoji: data.coverEmoji || "📝",
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  return getPostSlugs()
    .map(getPostBySlug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}
