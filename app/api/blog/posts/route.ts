import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const posts = getAllPosts().map(({ content, ...meta }) => meta);
  return NextResponse.json(posts);
}
