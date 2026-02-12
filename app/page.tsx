import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { onboarded: true },
  });

  if (!user?.onboarded) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
