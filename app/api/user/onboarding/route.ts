import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = onboardingSchema.parse(body);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        age: data.age,
        incomeSources: data.incomeSources,
        monthlyIncome: data.monthlyIncome,
        financialGoal: data.financialGoal,
        employmentStatus: data.employmentStatus || undefined,
        hasEmergencyFund: data.hasEmergencyFund || undefined,
        debtSituation: data.debtSituation || undefined,
        languagePref: data.languagePref,
        onboarded: true,
      },
    });

    // Send welcome email in the background (don't await — shouldn't block response)
    sendWelcomeEmail(session.email, {
      name: data.name,
      financialGoal: data.financialGoal,
      hasEmergencyFund: data.hasEmergencyFund || null,
      debtSituation: data.debtSituation || null,
      employmentStatus: data.employmentStatus || null,
    });

    return NextResponse.json({ message: "Onboarding complete" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
