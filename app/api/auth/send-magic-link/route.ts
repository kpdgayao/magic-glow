import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMagicLink } from "@/lib/mail";
import { emailSchema } from "@/lib/validations";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = emailSchema.parse(body);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Generate token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.magicLink.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send email
    await sendMagicLink(email, token);

    return NextResponse.json({ message: "Magic link sent" });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    console.error("Send magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
