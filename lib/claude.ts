import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";

let anthropicClient: Anthropic | null = null;

function getAnthropic() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

interface UserContext {
  name: string | null;
  age: number | null;
  incomeSources: string[];
  monthlyIncome: number | null;
  financialGoal: string | null;
  quizResult: string | null;
  employmentStatus: string | null;
  hasEmergencyFund: string | null;
  debtSituation: string | null;
  languagePref: "ENGLISH" | "TAGLISH";
}

function buildSystemPrompt(user: UserContext): string {
  const lang =
    user.languagePref === "TAGLISH"
      ? "Respond in Taglish (mix of Tagalog and English, casual Filipino conversational style). Use Filipino slang naturally."
      : "Respond in clear, simple English.";

  return `You are MoneyGlow AI, a friendly and encouraging Filipino financial literacy coach for young digital creators (ages 18-35).

## YOUR PERSONALITY
- Warm, supportive, like a cool ate/kuya who's good with money
- Use encouraging language, celebrate small wins
- Keep advice practical and actionable — no jargon
- Reference Filipino context: GCash, Maya, BIR, Pag-IBIG MP2, SSS, PhilHealth, digital banks (Tonik, Maya, GCash GSave)
- Never give investment advice or specific stock/crypto recommendations
- Focus on financial literacy: budgeting, saving, tracking, avoiding scams, tax basics for creators

## USER PROFILE
- Name: ${user.name || "not set"}
- Age: ${user.age || "not set"}
- Employment: ${user.employmentStatus?.replace(/_/g, " ").toLowerCase() || "not set"}
- Income sources: ${user.incomeSources.length > 0 ? user.incomeSources.join(", ") : "not set"}
- Estimated monthly income: ${user.monthlyIncome ? `₱${user.monthlyIncome.toLocaleString()}` : "not set"}
- Financial goal: ${user.financialGoal?.replace(/_/g, " ").toLowerCase() || "not set"}
- Has emergency fund: ${user.hasEmergencyFund?.toLowerCase() || "not set"}
- Debt situation: ${user.debtSituation?.replace(/_/g, " ").toLowerCase() || "not set"}
- Money personality: ${user.quizResult || "not taken yet"}

## CONTEXT
This user is a young Filipino digital creator building their online presence and income. Many are university students learning content creation, social media monetization, and financial management.

## LANGUAGE
${lang}

## RULES
1. Keep responses concise — max 3 short paragraphs unless the user asks for detail
2. Always give at least one specific, actionable tip
3. Use peso amounts (₱) in examples
4. If the user asks about something outside financial literacy, gently redirect
5. If the user seems distressed about money, be empathetic first, then offer practical steps
6. Encourage use of the app's other features (budget calculator, compound interest, tracker) when relevant
7. For tax questions, give general guidance only and recommend consulting a CPA for specific situations`;
}

export async function chat(userId: string, userMessage: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const messages = history.reverse().map((msg) => ({
    role: msg.role.toLowerCase() as "user" | "assistant",
    content: msg.content,
  }));

  messages.push({ role: "user", content: userMessage });

  await prisma.chatMessage.create({
    data: { userId, role: "USER", content: userMessage },
  });

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: buildSystemPrompt(user),
    messages,
  });

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : "";

  await prisma.chatMessage.create({
    data: { userId, role: "ASSISTANT", content: assistantMessage },
  });

  // Prune old messages (keep last 20)
  const allMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (allMessages.length > 20) {
    const toDelete = allMessages.slice(0, allMessages.length - 20);
    await prisma.chatMessage.deleteMany({
      where: { id: { in: toDelete.map((m) => m.id) } },
    });
  }

  return assistantMessage;
}

export async function streamChat(userId: string, userMessage: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const messages = history.reverse().map((msg) => ({
    role: msg.role.toLowerCase() as "user" | "assistant",
    content: msg.content,
  }));

  messages.push({ role: "user", content: userMessage });

  // Save user message to DB
  await prisma.chatMessage.create({
    data: { userId, role: "USER", content: userMessage },
  });

  const stream = getAnthropic().messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: buildSystemPrompt(user),
    messages,
  });

  return { stream, userId };
}

export async function saveChatResponse(userId: string, fullText: string) {
  await prisma.chatMessage.create({
    data: { userId, role: "ASSISTANT", content: fullText },
  });

  // Prune old messages (keep last 20)
  const allMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (allMessages.length > 20) {
    const toDelete = allMessages.slice(0, allMessages.length - 20);
    await prisma.chatMessage.deleteMany({
      where: { id: { in: toDelete.map((m) => m.id) } },
    });
  }
}

export function streamDailyAdvice(user: {
  name: string | null;
  age: number | null;
  incomeSources: string[];
  financialGoal: string | null;
  monthlyIncome: number | null;
  quizResult: string | null;
  employmentStatus: string | null;
  hasEmergencyFund: string | null;
  debtSituation: string | null;
  languagePref: "ENGLISH" | "TAGLISH";
}) {
  const lang =
    user.languagePref === "TAGLISH"
      ? "Respond in Taglish (mix of Tagalog and English, casual style)."
      : "Respond in clear, simple English.";

  const dayOfMonth = new Date().getDate() - 1;
  const topic = ADVICE_TOPICS[dayOfMonth % ADVICE_TOPICS.length];

  return getAnthropic().messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `You are MoneyGlow AI, a friendly Filipino financial literacy coach for young digital creators. Give one daily money tip. ${lang}`,
    messages: [
      {
        role: "user",
        content: `Give a short, actionable daily money tip about: ${topic}

Personalize for:
- Name: ${user.name || "Friend"}
- Age: ${user.age || "young adult"}
- Employment: ${user.employmentStatus?.replace(/_/g, " ").toLowerCase() || "creator"}
- Income sources: ${user.incomeSources.length > 0 ? user.incomeSources.join(", ") : "content creation"}
- Monthly income: ${user.monthlyIncome ? `₱${user.monthlyIncome.toLocaleString()}` : "varies"}
- Goal: ${user.financialGoal?.replace(/_/g, " ").toLowerCase() || "financial literacy"}
- Money personality: ${user.quizResult || "not taken"}
- Has emergency fund: ${user.hasEmergencyFund?.toLowerCase() || "unknown"}
- Debt: ${user.debtSituation?.replace(/_/g, " ").toLowerCase() || "unknown"}

Rules:
- Max 3 sentences
- Include one specific action they can do TODAY
- Use peso amounts in examples
- Be encouraging and warm`,
      },
    ],
  });
}

export async function generateQuizChallenge(
  userId: string,
  quizResult: string
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const lang =
    user.languagePref === "TAGLISH"
      ? "Respond in Taglish (mix of Tagalog and English)."
      : "Respond in clear, simple English.";

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: `You are MoneyGlow AI, a Filipino financial literacy coach. Generate a personalized 30-day money challenge. ${lang}`,
    messages: [
      {
        role: "user",
        content: `Generate a 30-day money challenge for a user with this profile:
- Money personality: ${quizResult}
- Name: ${user.name || "Friend"}
- Age: ${user.age || "18-35"}
- Employment: ${user.employmentStatus?.replace(/_/g, " ").toLowerCase() || "creator"}
- Income sources: ${user.incomeSources.join(", ") || "content creation"}
- Monthly income: ${user.monthlyIncome ? `₱${user.monthlyIncome}` : "varies"}
- Goal: ${user.financialGoal?.replace(/_/g, " ").toLowerCase() || "general financial literacy"}
- Has emergency fund: ${user.hasEmergencyFund?.toLowerCase() || "unknown"}
- Debt situation: ${user.debtSituation?.replace(/_/g, " ").toLowerCase() || "none"}

Format as 4 weekly themes with specific daily/weekly tasks. Include peso amounts where applicable. Make it achievable and encouraging. Use emojis sparingly. Format in markdown.`,
      },
    ],
  });

  const challenge =
    response.content[0].type === "text" ? response.content[0].text : "";

  await prisma.user.update({
    where: { id: userId },
    data: {
      quizResult: quizResult as "YOLO" | "CHILL" | "PLAN" | "MASTER",
      quizChallenge: challenge,
    },
  });

  return challenge;
}

const ADVICE_TOPICS = [
  "budgeting tips for irregular income",
  "saving strategies for young Filipinos",
  "avoiding online scams and fraud",
  "basic tax tips for content creators",
  "building an emergency fund",
  "smart use of digital banks (GCash, Maya, Tonik)",
  "tracking and growing creator income",
  "the power of compound interest",
  "needs vs wants — practical examples",
  "how to start investing with small amounts",
  "debt management tips",
  "negotiating brand deals as a creator",
  "financial goals and how to set them",
  "separating business and personal finances",
  "understanding BIR registration for creators",
  "GCash/Maya savings features",
  "how to budget for content creation expenses",
  "building multiple income streams",
  "financial red flags to watch for",
  "celebrating financial wins (no matter how small)",
  "automating your savings",
  "understanding SSS, PhilHealth, Pag-IBIG",
  "pricing your content creation services",
  "meal prep and food budgeting",
  "free financial literacy resources",
  "managing money with friends and family",
  "when to splurge vs when to save",
  "creator tax deductions you might miss",
  "setting up a simple bookkeeping system",
  "end-of-month money review tips",
];

export async function generateDailyAdvice(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const lang =
    user.languagePref === "TAGLISH"
      ? "Respond in Taglish (mix of Tagalog and English, casual style)."
      : "Respond in clear, simple English.";

  const dayOfMonth = new Date().getDate() - 1;
  const topic = ADVICE_TOPICS[dayOfMonth % ADVICE_TOPICS.length];

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `You are MoneyGlow AI, a friendly Filipino financial literacy coach for young digital creators. Give one daily money tip. ${lang}`,
    messages: [
      {
        role: "user",
        content: `Give a short, actionable daily money tip about: ${topic}

Personalize for:
- Name: ${user.name || "Friend"}
- Age: ${user.age || "young adult"}
- Employment: ${user.employmentStatus?.replace(/_/g, " ").toLowerCase() || "creator"}
- Income sources: ${user.incomeSources.join(", ") || "content creation"}
- Monthly income: ${user.monthlyIncome ? `₱${user.monthlyIncome.toLocaleString()}` : "varies"}
- Goal: ${user.financialGoal?.replace(/_/g, " ").toLowerCase() || "financial literacy"}
- Money personality: ${user.quizResult || "not taken"}
- Has emergency fund: ${user.hasEmergencyFund?.toLowerCase() || "unknown"}
- Debt: ${user.debtSituation?.replace(/_/g, " ").toLowerCase() || "unknown"}

Rules:
- Max 3 sentences
- Include one specific action they can do TODAY
- Use peso amounts in examples
- Be encouraging and warm`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
