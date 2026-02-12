import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!magicLink) {
      return NextResponse.json(
        { error: "Invalid or expired link" },
        { status: 400 }
      );
    }

    if (magicLink.usedAt) {
      return NextResponse.json(
        { error: "This link has already been used" },
        { status: 400 }
      );
    }

    if (new Date() > magicLink.expiresAt) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 400 }
      );
    }

    // Mark as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    // Create session
    const sessionToken = await createSession({
      userId: magicLink.user.id,
      email: magicLink.user.email,
    });

    await setSessionCookie(sessionToken);

    const redirectTo = magicLink.user.onboarded ? "/dashboard" : "/onboarding";

    return NextResponse.json({ redirectTo });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
