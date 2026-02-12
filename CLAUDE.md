# MONEYGLOW — Project Specification

## 🎯 Project Overview

**MoneyGlow** is a financial literacy web app for young Filipino digital creators, built as a companion tool for the Beauty for a Better Life (BFBL) program by L'Oréal Philippines × DTI × SPARK! Philippines.

**Live Date:** February 14, 2026 (Saturday, 9:00 AM PHT)
**Domain:** moneyglow.app (Cloudflare DNS → Railway)
**Audience:** 277 participants, mostly female, ages 18–35, UC Baguio students + other institutions, learning to become digital beauty creators via TikTok and Watsons Philippines.

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 (App Router) | TypeScript, strict mode |
| Styling | Tailwind CSS + shadcn/ui | Dark theme, mobile-first |
| Database | PostgreSQL + Prisma ORM | Railway hosted |
| Auth | JWT with jose | Magic link (passwordless) |
| Email | Mailjet | Magic link delivery |
| AI | Anthropic Claude SDK | claude-sonnet-4-5-20250514 |
| Deployment | Railway | Auto-deploy from GitHub |
| DNS | Cloudflare | moneyglow.app |

### Package Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "@prisma/client": "^6",
    "@anthropic-ai/sdk": "latest",
    "jose": "^5",
    "node-mailjet": "^6",
    "zod": "^3",
    "lucide-react": "latest",
    "date-fns": "^3",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "prisma": "^6",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "tailwindcss": "^3",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

---

## 📁 Project Structure

```
moneyglow/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, providers)
│   ├── page.tsx                      # Landing page (redirect to login or dashboard)
│   ├── globals.css                   # Tailwind + custom styles
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx            # Email input → send magic link
│   │   ├── verify/page.tsx           # Token verification from email link
│   │   └── layout.tsx                # Auth layout (centered, minimal)
│   │
│   ├── (app)/
│   │   ├── layout.tsx                # App layout (bottom nav, auth guard)
│   │   ├── dashboard/page.tsx        # Home — feature cards grid
│   │   ├── onboarding/page.tsx       # First-time user profile setup
│   │   ├── budget/page.tsx           # 50/30/20 calculator
│   │   ├── grow/page.tsx             # Compound interest calculator
│   │   ├── quiz/page.tsx             # Money personality quiz (5 questions)
│   │   ├── quiz/result/page.tsx      # Quiz result + AI 30-day challenge
│   │   ├── tracker/page.tsx          # Creator income tracker
│   │   ├── chat/page.tsx             # AI chat interface
│   │   └── profile/page.tsx          # Edit profile + language preference
│   │
│   └── api/
│       ├── auth/
│       │   ├── send-magic-link/route.ts   # POST — generate token, send email
│       │   ├── verify/route.ts            # GET — verify token, set session cookie
│       │   ├── me/route.ts                # GET — return current user from session
│       │   └── logout/route.ts            # POST — clear session cookie
│       ├── user/
│       │   ├── profile/route.ts           # GET/PUT — user profile
│       │   └── onboarding/route.ts        # POST — complete onboarding
│       ├── chat/route.ts                  # POST — AI chat (streaming)
│       ├── quiz/
│       │   └── result/route.ts            # POST — save result + generate AI challenge
│       ├── income/route.ts                # GET/POST/DELETE — income entries
│       └── budget/route.ts                # GET/POST — budget snapshots
│
├── lib/
│   ├── auth.ts                       # JWT sign/verify, getSession, requireAuth
│   ├── prisma.ts                     # Prisma client singleton
│   ├── claude.ts                     # Claude API helper + context builder
│   ├── mail.ts                       # Mailjet send magic link
│   ├── validations.ts                # Zod schemas for all inputs
│   └── utils.ts                      # cn() helper, formatCurrency, etc.
│
├── components/
│   ├── ui/                           # shadcn/ui components (button, card, input, etc.)
│   ├── bottom-nav.tsx                # Mobile bottom navigation
│   ├── chat-message.tsx              # Single chat bubble component
│   ├── chat-input.tsx                # Chat input with send button
│   ├── budget-bar.tsx                # Visual budget breakdown bar
│   ├── income-entry-card.tsx         # Single income entry display
│   ├── quiz-option.tsx               # Quiz answer option button
│   ├── progress-bar.tsx              # Reusable progress bar
│   └── compound-chart.tsx            # Bar chart for compound interest
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Optional: seed sample data
│
├── middleware.ts                      # Auth middleware (protect /app routes)
├── railway.json                      # Railway deployment config
├── .env.example                      # Environment variables template
└── CLAUDE.md                         # This file
```

---

## 🗄️ Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum LanguagePref {
  ENGLISH
  TAGLISH
}

enum FinancialGoal {
  SAVE_EMERGENCY_FUND
  PAY_OFF_DEBT
  START_INVESTING
  BUDGET_BETTER
  GROW_CREATOR_INCOME
}

enum QuizResult {
  YOLO
  CHILL
  PLAN
  MASTER
}

enum ChatRole {
  USER
  ASSISTANT
}

model User {
  id              String         @id @default(cuid())
  email           String         @unique
  name            String?
  age             Int?
  incomeSources   String[]       // ["TikTok", "YouTube", "GCash", etc.]
  monthlyIncome   Float?
  financialGoal   FinancialGoal?
  languagePref    LanguagePref   @default(ENGLISH)
  quizResult      QuizResult?
  quizChallenge   String?        // AI-generated 30-day challenge (markdown)
  onboarded       Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  chatMessages    ChatMessage[]
  incomeEntries   IncomeEntry[]
  budgetSnapshots BudgetSnapshot[]
  magicLinks      MagicLink[]
}

model MagicLink {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([token])
}

model ChatMessage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      ChatRole
  content   String
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}

model IncomeEntry {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  source    String   // "TikTok", "YouTube", "GCash", "Watsons", etc.
  type      String   // "Brand Deal", "Affiliate", "Commission", etc.
  amount    Float
  date      DateTime
  note      String?
  createdAt DateTime @default(now())

  @@index([userId, date])
}

model BudgetSnapshot {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  income    Float
  needs     Float
  wants     Float
  savings   Float
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

---

## 🔐 Authentication (Magic Link Flow)

### Flow

1. User enters email on `/login`
2. `POST /api/auth/send-magic-link` →
   - Find or create User by email
   - Generate a random token (crypto.randomUUID)
   - Store in MagicLink table with 15-min expiry
   - Send email via Mailjet with link: `https://moneyglow.app/verify?token=xxx`
3. User clicks link → `/verify?token=xxx`
4. `GET /api/auth/verify?token=xxx` →
   - Look up MagicLink, check not expired, check not used
   - Mark as used (set usedAt)
   - Generate JWT session token (7-day expiry) with { userId, email }
   - Set HTTP-only secure cookie `moneyglow_session`
   - Redirect to `/dashboard` (or `/onboarding` if user.onboarded === false)
5. Middleware checks cookie on all `/(app)` routes

### Auth Library (lib/auth.ts)

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'moneyglow_session';

interface SessionPayload {
  userId: string;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
```

### Middleware (middleware.ts)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

const PUBLIC_PATHS = ['/login', '/verify', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect all other routes
  const token = request.cookies.get('moneyglow_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('moneyglow_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

### Magic Link Email (lib/mail.ts)

```typescript
import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY!,
  apiSecret: process.env.MAILJET_SECRET_KEY!,
});

export async function sendMagicLink(email: string, token: string) {
  const magicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_SENDER_EMAIL!,
          Name: 'MoneyGlow',
        },
        To: [{ Email: email }],
        Subject: '✨ Your MoneyGlow Login Link',
        HTMLPart: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h1 style="font-size: 24px; color: #FF6B9D;">MoneyGlow ✨</h1>
            <p>Click the button below to sign in to your MoneyGlow account:</p>
            <a href="${magicUrl}" style="display: inline-block; background: #FF6B9D; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Sign In to MoneyGlow
            </a>
            <p style="color: #999; font-size: 13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #ccc; font-size: 11px;">MoneyGlow — Your Financial Glow-Up Starts Here<br>BFBL × L'Oréal × DTI × SPARK! Philippines</p>
          </div>
        `,
      },
    ],
  });
}
```

---

## 🤖 AI Integration

### Claude Context Builder (lib/claude.ts)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

interface UserContext {
  name: string | null;
  age: number | null;
  incomeSources: string[];
  monthlyIncome: number | null;
  financialGoal: string | null;
  quizResult: string | null;
  languagePref: 'ENGLISH' | 'TAGLISH';
}

function buildSystemPrompt(user: UserContext): string {
  const lang = user.languagePref === 'TAGLISH'
    ? 'Respond in Taglish (mix of Tagalog and English, casual Filipino conversational style). Use Filipino slang naturally.'
    : 'Respond in clear, simple English.';

  return `You are MoneyGlow AI, a friendly and encouraging Filipino financial literacy coach for young digital creators (ages 18-35).

## YOUR PERSONALITY
- Warm, supportive, like a cool ate/kuya who's good with money
- Use encouraging language, celebrate small wins
- Keep advice practical and actionable — no jargon
- Reference Filipino context: GCash, Maya, BIR, Pag-IBIG MP2, SSS, PhilHealth, digital banks (Tonik, Maya, GCash GSave)
- Never give investment advice or specific stock/crypto recommendations
- Focus on financial literacy: budgeting, saving, tracking, avoiding scams, tax basics for creators

## USER PROFILE
- Name: ${user.name || 'not set'}
- Age: ${user.age || 'not set'}
- Income sources: ${user.incomeSources.length > 0 ? user.incomeSources.join(', ') : 'not set'}
- Estimated monthly income: ${user.monthlyIncome ? `₱${user.monthlyIncome.toLocaleString()}` : 'not set'}
- Financial goal: ${user.financialGoal || 'not set'}
- Money personality: ${user.quizResult || 'not taken yet'}

## CONTEXT
This user is a participant in the Beauty for a Better Life (BFBL) program by L'Oréal Philippines, DTI, and SPARK! Philippines. They are learning to become digital beauty creators using TikTok and Watsons Philippines. Many are university students in Baguio City.

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
  // Get user profile
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  // Get last 20 messages for context
  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Reverse to chronological order
  const messages = history.reverse().map((msg) => ({
    role: msg.role.toLowerCase() as 'user' | 'assistant',
    content: msg.content,
  }));

  // Add new user message
  messages.push({ role: 'user', content: userMessage });

  // Save user message to DB
  await prisma.chatMessage.create({
    data: { userId, role: 'USER', content: userMessage },
  });

  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 1024,
    system: buildSystemPrompt(user),
    messages,
  });

  const assistantMessage = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Save assistant message to DB
  await prisma.chatMessage.create({
    data: { userId, role: 'ASSISTANT', content: assistantMessage },
  });

  // Prune old messages (keep last 20)
  const allMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  if (allMessages.length > 20) {
    const toDelete = allMessages.slice(0, allMessages.length - 20);
    await prisma.chatMessage.deleteMany({
      where: { id: { in: toDelete.map((m) => m.id) } },
    });
  }

  return assistantMessage;
}

export async function generateQuizChallenge(userId: string, quizResult: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const lang = user.languagePref === 'TAGLISH'
    ? 'Respond in Taglish (mix of Tagalog and English).'
    : 'Respond in clear, simple English.';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 1500,
    system: `You are MoneyGlow AI, a Filipino financial literacy coach. Generate a personalized 30-day money challenge. ${lang}`,
    messages: [
      {
        role: 'user',
        content: `Generate a 30-day money challenge for a user with this profile:
- Money personality: ${quizResult}
- Name: ${user.name || 'Friend'}
- Age: ${user.age || '18-35'}
- Income sources: ${user.incomeSources.join(', ') || 'content creation'}
- Monthly income: ${user.monthlyIncome ? `₱${user.monthlyIncome}` : 'varies'}
- Goal: ${user.financialGoal || 'general financial literacy'}

Format as 4 weekly themes with specific daily/weekly tasks. Include peso amounts where applicable. Make it achievable and encouraging. Use emojis sparingly. Format in markdown.`,
      },
    ],
  });

  const challenge = response.content[0].type === 'text' ? response.content[0].text : '';

  // Save to user profile
  await prisma.user.update({
    where: { id: userId },
    data: { quizResult: quizResult as any, quizChallenge: challenge },
  });

  return challenge;
}
```

### Chat API Route (app/api/chat/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { chat } from '@/lib/claude';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { message } = chatSchema.parse(body);

    const response = await chat(session.userId, message);

    return NextResponse.json({ message: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
```

---

## 🎨 Design System

### Theme (Dark, Mobile-First)

```css
/* globals.css — key design tokens */
:root {
  --bg: #0D0D0D;
  --card: #1A1A1A;
  --border: #2A2A2A;
  --accent: #FF6B9D;          /* Primary — pink */
  --accent-alt: #FFB86C;      /* Secondary — amber */
  --accent-teal: #50E3C2;     /* Success — teal */
  --accent-blue: #6C9CFF;     /* Info — blue */
  --text: #F5F5F5;
  --text-muted: #999999;
  --text-dim: #666666;
}
```

### Typography
- **Headings:** Playfair Display (serif) — loaded via Google Fonts
- **Body:** DM Sans (sans-serif) — loaded via Google Fonts
- Both loaded in `app/layout.tsx` via `next/font/google`

### Bottom Navigation
5 tabs: Home (✦), Budget (₱), Grow (📈), Quiz (🧠), Track (💰)
Plus a floating "Ask MoneyGlow" chat button (bottom-right, above nav)

### Mobile-First
- Max width: 480px centered
- All touch targets: minimum 44px
- Bottom nav: fixed, blur backdrop
- Cards: 16px border radius, subtle borders

---

## 📄 Page Specifications

### Login Page (`/login`)
- MoneyGlow logo + tagline "Your Financial Glow-Up Starts Here"
- Email input field
- "Send Magic Link" button
- Subtitle: "We'll send you a sign-in link — no password needed!"
- BFBL program badge at bottom
- After sending: show confirmation message "Check your email! ✨"

### Onboarding Page (`/onboarding`)
- Step 1: Name + Age
- Step 2: Income sources (multi-select chips: TikTok, YouTube, Instagram, Facebook, GCash, Maya, Watsons, Shopee, Lazada, Freelance, Allowance, Part-time Job, Other)
- Step 3: Estimated monthly income (slider or preset buttons: ₱1K–5K, ₱5K–10K, ₱10K–20K, ₱20K+)
- Step 4: Financial goal (single select: Save Emergency Fund, Pay Off Debt, Start Investing, Budget Better, Grow Creator Income)
- Step 5: Language preference (English / Taglish)
- Progress bar at top
- "Get Started" button → redirect to dashboard

### Dashboard (`/dashboard`)
- Greeting: "Hi {name}! ✨" or "Hi there! ✨" if no name
- 4 feature cards in 2×2 grid (same as the artifact we built):
  - Budget (₱) — 50/30/20 Calculator
  - Grow (📈) — Compound Interest
  - Quiz (🧠) — Money Personality
  - Track (💰) — Income Tracker
- If quiz taken: show result badge
- Quick stats: total tracked income this month, last budget snapshot
- AI tip of the day (can be static for MVP, or a cached AI-generated tip)

### Budget Page (`/budget`)
- Income input + quick preset buttons (₱5K, ₱10K, ₱15K, ₱20K)
- Calculate button → show 50/30/20 split
- Visual bar showing the 3 categories
- Each category card with Filipino-relevant expense examples:
  - NEEDS (50%): Rent/board, food, transpo, phone load/WiFi, school supplies
  - WANTS (30%): Shopping, milk tea, Netflix/Spotify, eating out, gaming
  - SAVINGS (20%): Emergency fund, GCash/Maya savings, future goals, investing
- "Save Budget" button → stores BudgetSnapshot
- "Get AI Advice" button → sends budget to chat with pre-filled message
- Creator tip card at bottom

### Grow Page (`/grow`)
- 3 sliders: Monthly savings (₱100–₱10,000), Years (1–30), Interest rate (1%–15%)
- Big result number: "After X years, you'll have ₱X"
- Deposited vs Interest earned breakdown
- Bar chart showing growth over time (deposited in blue, interest in amber)
- Reference rates: "Maya Savings ~3%, Tonik ~4.5%, Pag-IBIG MP2 ~6-7%"
- Tip card about starting early

### Quiz Page (`/quiz`)
- 5 multiple choice questions (see quiz data below)
- Progress bar
- Animated transitions between questions
- Each option is a tappable card with letter indicator (A, B, C, D)

### Quiz Result Page (`/quiz/result`)
- Big emoji + personality type title + color
- Description paragraph
- "Your Next Step" tip card
- **"Get Your 30-Day Challenge" button** → calls AI to generate personalized challenge
- Challenge displayed as formatted markdown
- "Share your result in the chat!" prompt
- "Retake Quiz" button

### Tracker Page (`/tracker`)
- Total earnings summary card
- "By Platform" breakdown with progress bars (color-coded per platform)
- List of income entries (source, type, amount, date) with delete button
- "Add Income" button → expandable form:
  - Platform (chip selector): TikTok, YouTube, Instagram, Facebook, GCash, Maya, Watsons, Shopee, Lazada, Other
  - Type (chip selector): Brand Deal, Affiliate, Commission, Ad Revenue, Tips/Gifts, Freelance, Other
  - Amount (₱)
  - Date
- Pro tip card about tracking gross vs net income

### Chat Page (`/chat`)
- Full-screen chat interface
- Chat history (from DB, last 20 messages)
- Input bar at bottom with send button
- Welcome message if no history: "Hi! I'm MoneyGlow AI ✨ Ask me anything about managing your money as a digital creator!"
- Suggested quick prompts (tappable chips):
  - "How do I start saving?"
  - "Paano mag-budget with irregular income?"
  - "What's the 50/30/20 rule?"
  - "How much tax do content creators pay?"
  - "Is this investment a scam?"
- Messages render markdown (bold, lists, etc.)
- Loading indicator while AI responds

### Profile Page (`/profile`)
- View/edit: Name, Age, Income sources, Monthly income, Financial goal
- Language preference toggle (English / Taglish)
- Quiz result display (if taken)
- Logout button

---

## 📝 Quiz Data

```typescript
const QUIZ_QUESTIONS = [
  {
    q: "You receive ₱5,000 from a brand deal. What do you do first?",
    options: [
      { text: "Celebrate with a shopping spree! 🛍️", type: "YOLO" },
      { text: "Save some, spend some — balance lang", type: "CHILL" },
      { text: "Put 50% in savings, budget the rest", type: "PLAN" },
      { text: "Track it, allocate to budget categories, save 20%+", type: "MASTER" },
    ],
  },
  {
    q: "It's month-end and you have ₱2,000 left. You…",
    options: [
      { text: "Treat myself — I earned it! 🎉", type: "YOLO" },
      { text: "Transfer half to GCash savings, keep the rest", type: "CHILL" },
      { text: "Add it all to my emergency fund", type: "PLAN" },
      { text: "Review my spending this month and adjust next month's budget", type: "MASTER" },
    ],
  },
  {
    q: "A friend says 'invest ₱10,000 and get ₱100,000 in one month!' You…",
    options: [
      { text: "Send money ASAP — sounds amazing!", type: "YOLO" },
      { text: "Ask a few questions but probably try it", type: "CHILL" },
      { text: "Research first — if it's too good to be true, it probably is", type: "PLAN" },
      { text: "Report it as a potential scam and warn others", type: "MASTER" },
    ],
  },
  {
    q: "Your phone breaks. What's your move?",
    options: [
      { text: "Buy the latest model on installment — YOLO!", type: "YOLO" },
      { text: "Get it repaired, or buy a cheaper replacement", type: "CHILL" },
      { text: "Use my emergency fund — this is what it's for", type: "PLAN" },
      { text: "Claim warranty/insurance, use emergency fund as backup", type: "MASTER" },
    ],
  },
  {
    q: "How do you track your income from content creation?",
    options: [
      { text: "I don't — basta may pera, okay na 💅", type: "YOLO" },
      { text: "I check my GCash/Maya history sometimes", type: "CHILL" },
      { text: "I use a spreadsheet or notes app", type: "PLAN" },
      { text: "I have a system: tracker, separate accounts, tax set-aside", type: "MASTER" },
    ],
  },
];

const QUIZ_RESULTS = {
  YOLO: {
    title: "💃 The YOLO Spender",
    color: "#FF6B9D",
    desc: "You live for the moment! That's fun, but your future self might not agree. Time to build some money habits that let you enjoy NOW while securing LATER.",
    tip: "Start with one small step: save ₱100 every time you earn from content.",
  },
  CHILL: {
    title: "😎 The Chill Saver",
    color: "#FFB86C",
    desc: "You have basic money awareness but no real system. You're halfway there! A little structure will take you from 'okay' to 'thriving.'",
    tip: "Try the 50/30/20 rule this month. Use the Budget tab!",
  },
  PLAN: {
    title: "📋 The Planner",
    color: "#6C9CFF",
    desc: "You think ahead and make smart choices. You're already ahead of most people your age. Now level up to automate and optimize.",
    tip: "Explore compound interest in the Grow tab — see how your savings multiply!",
  },
  MASTER: {
    title: "👑 The Money Master",
    color: "#50E3C2",
    desc: "You're financially savvy! You track, plan, and protect your money like a pro. Keep going and help your friends level up too.",
    tip: "Consider MP2, mutual funds, or digital banks with higher interest.",
  },
};
```

---

## 🚀 Deployment

### Railway Configuration

```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm prisma generate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables

```bash
# .env.example

# ── Database ──
DATABASE_URL="postgresql://user:password@host:5432/moneyglow_db"

# ── Auth ──
JWT_SECRET="generate-a-random-64-char-string-here"

# ── App ──
NEXT_PUBLIC_APP_URL="https://moneyglow.app"

# ── AI ──
ANTHROPIC_API_KEY="sk-ant-api03-..."

# ── Email (Mailjet) ──
MAILJET_API_KEY="your-mailjet-api-key"
MAILJET_SECRET_KEY="your-mailjet-secret-key"
MAILJET_SENDER_EMAIL="hello@moneyglow.app"
```

### Cloudflare DNS Setup

Add CNAME record:
- Name: `@` (or `moneyglow.app`)
- Target: `<your-railway-app>.up.railway.app`
- Proxy: OFF (DNS only — Railway handles SSL)

---

## ✅ Implementation Checklist

### Phase 1: Foundation (First)
- [ ] Initialize Next.js 15 project with TypeScript, Tailwind, shadcn/ui
- [ ] Set up Prisma schema and connect to Railway PostgreSQL
- [ ] Run initial migration: `pnpm prisma migrate dev --name init`
- [ ] Install shadcn/ui components: button, card, input, badge, separator, avatar, dialog, dropdown-menu, toast
- [ ] Set up Google Fonts (Playfair Display + DM Sans) in layout.tsx
- [ ] Create globals.css with dark theme CSS variables
- [ ] Create lib/utils.ts with cn() helper and formatCurrency()
- [ ] Create lib/prisma.ts singleton

### Phase 2: Authentication
- [ ] Create lib/auth.ts (JWT sign/verify/getSession/requireAuth)
- [ ] Create lib/mail.ts (Mailjet magic link sender)
- [ ] Create middleware.ts (protect app routes)
- [ ] Build POST /api/auth/send-magic-link
- [ ] Build GET /api/auth/verify
- [ ] Build GET /api/auth/me
- [ ] Build POST /api/auth/logout
- [ ] Build login page UI
- [ ] Build verify page UI (loading → success → redirect)

### Phase 3: Onboarding
- [ ] Build POST /api/user/onboarding
- [ ] Build GET/PUT /api/user/profile
- [ ] Build onboarding page UI (multi-step form)
- [ ] Redirect logic: if !onboarded → /onboarding

### Phase 4: Core Features (Port from artifact)
- [ ] Build dashboard page (feature cards grid)
- [ ] Build bottom navigation component
- [ ] Build budget page (50/30/20 calculator)
- [ ] Build POST/GET /api/budget (save/load snapshots)
- [ ] Build grow page (compound interest calculator)
- [ ] Build quiz page (5 questions with transitions)
- [ ] Build tracker page (income entries CRUD)
- [ ] Build GET/POST/DELETE /api/income
- [ ] Build profile page (view/edit)

### Phase 5: AI Features
- [ ] Create lib/claude.ts (context builder + chat + quiz challenge)
- [ ] Build POST /api/chat
- [ ] Build POST /api/quiz/result (save + generate challenge)
- [ ] Build chat page UI (messages, input, suggested prompts)
- [ ] Build quiz result page with "Get 30-Day Challenge" button
- [ ] Add "Get AI Advice" button on budget page

### Phase 6: Polish & Deploy
- [ ] Loading states on all pages
- [ ] Error handling (toast notifications)
- [ ] Empty states (no income entries, no chat history, etc.)
- [ ] Mobile responsiveness check (test on 375px width)
- [ ] Deploy to Railway
- [ ] Set up Cloudflare DNS CNAME
- [ ] Test magic link flow end-to-end
- [ ] Test AI chat with both English and Taglish
- [ ] Test on mobile browser (Chrome Android, Safari iOS)

---

## 🧪 Testing Checklist (Pre-Launch)

- [ ] Magic link: send → receive → click → logged in
- [ ] Onboarding: complete all steps → lands on dashboard
- [ ] Budget: calculate → save → reload shows saved
- [ ] Compound: sliders work smoothly, numbers update
- [ ] Quiz: complete all 5 → correct result → save to DB
- [ ] Quiz challenge: generate → display markdown → persists
- [ ] Tracker: add entry → shows in list → delete works
- [ ] Chat: send message → get response → history persists
- [ ] Chat: test Taglish mode
- [ ] Profile: edit → save → reload shows changes
- [ ] Logout: clears session → redirects to login
- [ ] Mobile: all pages render correctly on phone
- [ ] 277 concurrent users: ensure Railway instance can handle load

---

## ⚠️ Important Notes

1. **Token costs:** Claude Sonnet at ~$3/M input, ~$15/M output tokens. With 277 users, budget for ~$20-50 in API costs for the seminar day. Set max_tokens to 1024 for chat responses.
2. **Rate limiting:** Consider adding basic rate limiting on /api/chat (e.g., max 20 messages per user per hour) to prevent abuse.
3. **Magic link expiry:** 15 minutes. If a user's link expires, they just request a new one.
4. **No password storage:** This app never stores passwords. Auth is entirely via magic links.
5. **Data privacy:** Only collect what's needed. Users can delete their account from the profile page (stretch goal).
6. **Mailjet sender:** You'll need to verify the sender domain (moneyglow.app) in Mailjet or use an existing verified sender.
