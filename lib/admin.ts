import { requireAuth, type SessionPayload } from "./auth";
import { prisma } from "./prisma";

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true },
  });
  if (!user.isAdmin) throw new Error("Forbidden");
  return session;
}
