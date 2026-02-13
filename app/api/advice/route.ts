import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamDailyAdvice } from "@/lib/claude";
import { awardXP, updateStreak } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const peek = req.nextUrl.searchParams.get("peek") === "true";

    // Get today's date (UTC, date only)
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    // Check for existing advice today
    const existing = await prisma.dailyAdvice.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ advice: existing.content, cached: true });
    }

    // Peek mode: return null if no cached advice (don't generate)
    if (peek) {
      return NextResponse.json({ advice: null, cached: false });
    }

    // Generate new advice via streaming
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: {
        name: true,
        financialGoal: true,
        monthlyIncome: true,
        languagePref: true,
      },
    });

    const stream = streamDailyAdvice(user);
    const encoder = new TextEncoder();
    let fullText = "";
    const userId = session.userId;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = event.delta.text;
              fullText += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
              );
            }
          }

          // Save to DB
          await prisma.dailyAdvice.create({
            data: {
              userId,
              content: fullText,
              date: today,
            },
          });

          // Award XP and update streak
          await awardXP(userId, "GET_DAILY_ADVICE");
          await updateStreak(userId);

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Advice stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Advice error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
