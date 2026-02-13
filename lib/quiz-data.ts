export const QUIZ_QUESTIONS = [
  {
    q: "You receive ₱5,000 from a brand deal. What do you do first?",
    options: [
      { text: "Celebrate with a shopping spree!", type: "YOLO" as const },
      { text: "Save some, spend some — balance lang", type: "CHILL" as const },
      { text: "Put 50% in savings, budget the rest", type: "PLAN" as const },
      {
        text: "Track it, allocate to budget categories, save 20%+",
        type: "MASTER" as const,
      },
    ],
  },
  {
    q: "It's month-end and you have ₱2,000 left. You…",
    options: [
      { text: "Treat myself — I earned it!", type: "YOLO" as const },
      {
        text: "Transfer half to GCash savings, keep the rest",
        type: "CHILL" as const,
      },
      { text: "Add it all to my emergency fund", type: "PLAN" as const },
      {
        text: "Review my spending this month and adjust next month's budget",
        type: "MASTER" as const,
      },
    ],
  },
  {
    q: "A friend says 'invest ₱10,000 and get ₱100,000 in one month!' You…",
    options: [
      { text: "Send money ASAP — sounds amazing!", type: "YOLO" as const },
      {
        text: "Ask a few questions but probably try it",
        type: "CHILL" as const,
      },
      {
        text: "Research first — if it's too good to be true, it probably is",
        type: "PLAN" as const,
      },
      {
        text: "Report it as a potential scam and warn others",
        type: "MASTER" as const,
      },
    ],
  },
  {
    q: "Your phone breaks. What's your move?",
    options: [
      {
        text: "Buy the latest model on installment — YOLO!",
        type: "YOLO" as const,
      },
      {
        text: "Get it repaired, or buy a cheaper replacement",
        type: "CHILL" as const,
      },
      {
        text: "Use my emergency fund — this is what it's for",
        type: "PLAN" as const,
      },
      {
        text: "Claim warranty/insurance, use emergency fund as backup",
        type: "MASTER" as const,
      },
    ],
  },
  {
    q: "How do you track your income from content creation?",
    options: [
      {
        text: "I don't — basta may pera, okay na",
        type: "YOLO" as const,
      },
      {
        text: "I check my GCash/Maya history sometimes",
        type: "CHILL" as const,
      },
      { text: "I use a spreadsheet or notes app", type: "PLAN" as const },
      {
        text: "I have a system: tracker, separate accounts, tax set-aside",
        type: "MASTER" as const,
      },
    ],
  },
];

export type QuizResultType = "YOLO" | "CHILL" | "PLAN" | "MASTER";

export const QUIZ_RESULTS: Record<
  QuizResultType,
  { title: string; emoji: string; color: string; desc: string; tip: string }
> = {
  YOLO: {
    title: "The YOLO Spender",
    emoji: "💃",
    color: "#FF6B9D",
    desc: "You live for the moment! That's fun, but your future self might not agree. Time to build some money habits that let you enjoy NOW while securing LATER.",
    tip: "Start with one small step: save ₱100 every time you earn from content.",
  },
  CHILL: {
    title: "The Chill Saver",
    emoji: "😎",
    color: "#FFB86C",
    desc: "You have basic money awareness but no real system. You're halfway there! A little structure will take you from 'okay' to 'thriving.'",
    tip: "Try the 50/30/20 rule this month. Use the Budget tab!",
  },
  PLAN: {
    title: "The Planner",
    emoji: "📋",
    color: "#6C9CFF",
    desc: "You think ahead and make smart choices. You're already ahead of most people your age. Now level up to automate and optimize.",
    tip: "Explore compound interest in the Insights tab — see how your savings multiply!",
  },
  MASTER: {
    title: "The Money Master",
    emoji: "👑",
    color: "#50E3C2",
    desc: "You're financially savvy! You track, plan, and protect your money like a pro. Keep going and help your friends level up too.",
    tip: "Consider MP2, mutual funds, or digital banks with higher interest.",
  },
};
