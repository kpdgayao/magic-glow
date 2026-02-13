// Shared constants used across onboarding, profile, tracker, and budget pages

export const INCOME_SOURCES = [
  "TikTok",
  "YouTube",
  "Instagram",
  "Facebook",
  "GCash",
  "Maya",
  "Shopee",
  "Lazada",
  "Freelance",
  "Allowance",
  "Part-time Job",
  "Other",
];

export const INCOME_RANGES = [
  { label: "\u20B11K\u20135K", value: 3000 },
  { label: "\u20B15K\u201310K", value: 7500 },
  { label: "\u20B110K\u201320K", value: 15000 },
  { label: "\u20B120K\u201350K", value: 35000 },
  { label: "\u20B150K\u2013100K", value: 75000 },
  { label: "\u20B1100K+", value: 125000 },
];

export const FINANCIAL_GOALS = [
  { value: "SAVE_EMERGENCY_FUND", label: "Save Emergency Fund" },
  { value: "PAY_OFF_DEBT", label: "Pay Off Debt" },
  { value: "START_INVESTING", label: "Start Investing" },
  { value: "BUDGET_BETTER", label: "Budget Better" },
  { value: "GROW_CREATOR_INCOME", label: "Grow Creator Income" },
];

export const PLATFORMS = [
  "TikTok",
  "YouTube",
  "Instagram",
  "Facebook",
  "GCash",
  "Maya",
  "Shopee",
  "Lazada",
  "Other",
];

export const INCOME_TYPES = [
  "Brand Deal",
  "Affiliate",
  "Commission",
  "Ad Revenue",
  "Tips/Gifts",
  "Freelance",
  "Other",
];

export const PLATFORM_COLORS: Record<string, string> = {
  TikTok: "bg-mg-pink",
  YouTube: "bg-red-500",
  Instagram: "bg-purple-500",
  Facebook: "bg-blue-500",
  GCash: "bg-mg-blue",
  Maya: "bg-green-500",
  Shopee: "bg-orange-500",
  Lazada: "bg-mg-blue",
  Other: "bg-muted-foreground",
};

export const EXPENSE_SUBCATEGORIES = {
  NEEDS: ["Food", "Rent/Board", "Transport", "Load/WiFi", "Utilities", "School", "Health", "Other"],
  WANTS: ["Shopping", "Eating Out", "Coffee/Milk Tea", "Streaming", "Gaming", "Barkada", "Online Shopping", "Other"],
  SAVINGS: ["Emergency Fund", "GCash/Maya Savings", "Investments", "Pag-IBIG/SSS", "Other"],
};

export const BUDGET_PRESETS = [5000, 10000, 20000, 50000, 100000];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
