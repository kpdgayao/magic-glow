import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { chat } from "@/lib/claude";
import { chatMessageSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { message } = chatMessageSchema.parse(body);

    const response = await chat(session.userId, message);

    return NextResponse.json({ message: response });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
