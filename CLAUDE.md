# MoneyGlow

Financial literacy web app for young Filipino digital creators (ages 18-35), powered by IOL Inc.
Live at moneyglow.app. Deployed on Railway via custom Dockerfile (node:22-slim, standalone output).

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm prisma generate  # Regenerate Prisma client
pnpm prisma migrate dev --name <name>  # Create migration
```

## Rules — MUST Follow

### Code Quality
- IMPORTANT: Minimum font size is 12px (`text-xs`). NEVER use `text-[10px]` or `text-[11px]`.
- IMPORTANT: All touch targets must be at least 44x44px.
- IMPORTANT: Mailjet and Anthropic clients MUST be lazy-initialized (not at module top level) to avoid build-time errors.
- Use `sonner` for toasts — NOT the deprecated shadcn `toast` component.
- Use shared constants from `lib/constants.ts` — never duplicate inline.
- Validate all API inputs with Zod schemas from `lib/validations.ts`.
- Use `requireAuth()` from `lib/auth.ts` in API routes. Use `requireAdmin()` from `lib/admin.ts` (NOT auth.ts — auth.ts is edge-compatible, admin.ts uses Prisma).

### Design
- Dark theme only, mobile-first, max-width 480px centered.
- Fonts: DM Sans (body), Playfair Display (headings) — via `next/font/google`.
- Colors: pink `#FF6B9D`, amber `#FFB86C`, teal `#50E3C2`, blue `#6C9CFF`.
- Cards: 16px border-radius, subtle borders on `#1A1A1A` background.
- Muted text: `#AAAAAA` (not `#999`) for AAA contrast on `#0D0D0D`.

### Accessibility (WCAG 2.1 AA)
- `aria-live="polite"` on streaming/dynamic content containers.
- `aria-label` on all icon-only buttons.
- `htmlFor`/`id` on all form label-input pairs.
- `prefers-reduced-motion` media query disables animations (see `globals.css`).
- Semantic HTML: proper heading hierarchy, `<nav>`, `<main id="main-content">`.
- Skip-to-content link in root `layout.tsx`.

### Deployment
- Railway with custom Dockerfile — NOT Nixpacks (Node/corepack issues).
- Next.js standalone output mode for Docker.
- Middleware matcher MUST exclude `manifest.json`, `sw.js`, `icons/` — otherwise PWA install breaks.
- `PUBLIC_PATHS` in middleware: `/login`, `/verify`, `/api/auth`, `/blog`, `/api/blog`, `/share`.

## Tech Stack

| Layer | Technology | Key Detail |
|-------|------------|------------|
| Framework | Next.js 15 (App Router) | TypeScript, strict mode |
| Styling | Tailwind CSS v4 + shadcn/ui | `@import "tailwindcss"` + `@theme inline {}` syntax |
| Database | PostgreSQL + Prisma 7 | Driver adapter pattern (`@prisma/adapter-pg`), config in `prisma.config.ts` |
| Auth | JWT with `jose` | Magic link (passwordless), 7-day session, cookie: `moneyglow_session` |
| Email | Mailjet | Magic links + welcome email |
| AI | Anthropic Claude SDK | Model: `claude-haiku-4-5-20251001`, max_tokens: 1024 |
| Deployment | Railway | Custom Dockerfile, auto-deploy from GitHub |

## Architecture

### Route Groups
- `(auth)/` — Login, verify (public)
- `(app)/` — All authenticated pages (bottom nav, auth guard)
- `(blog)/` — Public blog + quiz share pages (no auth, no bottom nav)
- `(admin)/` — Admin dashboard (desktop layout, sidebar, admin guard)

### Key Libraries (read source for details)
- `lib/auth.ts` — JWT session management, `getSession()`, `requireAuth()`
- `lib/claude.ts` — AI chat (streaming SSE via `streamChat()`), daily advice (`streamDailyAdvice()`), quiz challenges
- `lib/gamification.ts` — XP awards, levels (Newbie→Money Master), glow score (0-100 composite)
- `lib/badges.ts` — 10 achievement badges, `computeBadges()` with parallel Prisma queries
- `lib/constants.ts` — All shared constants (income sources, categories, platforms, etc.)
- `lib/mail.ts` — Mailjet magic link + welcome email with personalized blog suggestions
- `lib/blog.ts` — Markdown blog posts from `content/blog/` (gray-matter + marked)
- `lib/format-markdown.ts` — Shared markdown→HTML for chat, advice, dashboard
- `lib/admin.ts` — `requireAdmin()` guard (uses Prisma, NOT edge-compatible)

### Auth Flow
1. User enters email → `POST /api/auth/send-magic-link` → token with 15-min expiry
2. Email link → `/verify?token=xxx` → `GET /api/auth/verify` → JWT cookie set
3. Redirect to `/dashboard` (or `/onboarding` if not onboarded)
4. Middleware checks cookie on all non-public routes

### AI Integration
- Chat + daily advice use SSE streaming (`text/event-stream`)
- Advice API: `?peek=true` returns cached only (for dashboard teaser, avoids slow generation)
- Daily advice cached per user/day in `DailyAdvice` table, rotates 30 topics
- All AI prompts are enriched with full user profile context (see `buildSystemPrompt()` in `lib/claude.ts`)

### Gamification
- XP: LOG_INCOME(10), SAVE_BUDGET(15), GET_DAILY_ADVICE(20), COMPLETE_QUIZ(25), LOG_EXPENSE(5)
- Levels: Newbie(0), Rising Star(100), Pro Creator(300), Money Master(600)
- Glow score: 0-100 composite from income, expenses, budget, streak, XP
- Streak: consecutive days visiting advice page

## Branding
- App by **IOL Inc.** (iol.ph) — NOT L'Oreal, NOT BFBL
- Login footer + email footer: "Powered by IOL Inc."
- "Watsons" must NOT appear in income sources or anywhere in the app

## Database
- Schema: `prisma/schema.prisma` (read it directly for current models and enums)
- Applied migrations: `init`, `add_gamification_and_daily_advice`, `add_expense_tracking`, `add_profile_context_fields`, `add_admin_field`, `add_feedback`
- Admin user: `kpdgayao@pm.me` (isAdmin: true)

## Pages Overview
- `/` — Public landing page (session-aware: "Dashboard" vs "Sign In")
- `/dashboard` — Glow score, streak, XP bar, 4 feature cards, advice teaser, feedback prompt
- `/budget` — Monthly budget (50/30/20), expense tracking, month navigation
- `/insights` — Income vs expense trends, compound interest calculator, tax estimator (8% vs graduated)
- `/advice` — Daily AI advice (streaming), streak counter, XP/level display
- `/tracker` — Monthly income entries with platform breakdown
- `/chat` — AI chat with streaming SSE, 20-message history
- `/quiz` + `/quiz/result` — Money personality quiz (YOLO/CHILL/PLAN/MASTER) + 30-day challenge
- `/profile` — Edit profile, badges grid, quiz access, logout
- `/blog` — Public blog (10 SEO posts), `/blog/[slug]` — individual posts (SSG)
- `/share/quiz/[type]` — Public quiz share pages with dynamic OG images
- `/admin` — Stats, `/admin/users` — user list, `/admin/users/[id]` — detail, `/admin/feedback` — feedback

## Environment Variables
See `.env.example` for required variables: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `ANTHROPIC_API_KEY`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_SENDER_EMAIL`.

## Important Constraints
- Claude Haiku costs: ~$1/M input, ~$5/M output tokens. Budget ~$20-50 for seminar day (277 users).
- Chat max_tokens: 1024. Consider rate limiting (20 msgs/user/hour).
- Magic link expiry: 15 minutes. No passwords stored anywhere.
- OG images for quiz share pages: use Node.js runtime, NOT edge (conflicts with generateStaticParams).
- Bottom nav: 5 tabs (Home, Budget, Insights, Advice, Track) + floating chat FAB.
- Onboarding: 8 steps — steps 5-7 optional (employment, emergency fund, debt).
