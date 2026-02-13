import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  age: z.number().int().min(13).max(100),
  incomeSources: z.array(z.string()).min(1, "Select at least one income source"),
  monthlyIncome: z.number().min(0),
  financialGoal: z.enum([
    "SAVE_EMERGENCY_FUND",
    "PAY_OFF_DEBT",
    "START_INVESTING",
    "BUDGET_BETTER",
    "GROW_CREATOR_INCOME",
  ]),
  employmentStatus: z.enum([
    "FULL_TIME_CREATOR",
    "STUDENT",
    "PART_TIME_PLUS_CREATOR",
    "EMPLOYED_PLUS_SIDE_HUSTLE",
  ]).optional(),
  hasEmergencyFund: z.enum(["YES", "NO", "BUILDING"]).optional(),
  debtSituation: z.enum(["NONE", "STUDENT_LOAN", "CREDIT_CARD", "INFORMAL_DEBT"]).optional(),
  languagePref: z.enum(["ENGLISH", "TAGLISH"]),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(100).optional(),
  incomeSources: z.array(z.string()).optional(),
  monthlyIncome: z.number().min(0).optional(),
  financialGoal: z
    .enum([
      "SAVE_EMERGENCY_FUND",
      "PAY_OFF_DEBT",
      "START_INVESTING",
      "BUDGET_BETTER",
      "GROW_CREATOR_INCOME",
    ])
    .optional(),
  employmentStatus: z.enum([
    "FULL_TIME_CREATOR",
    "STUDENT",
    "PART_TIME_PLUS_CREATOR",
    "EMPLOYED_PLUS_SIDE_HUSTLE",
  ]).nullable().optional(),
  hasEmergencyFund: z.enum(["YES", "NO", "BUILDING"]).nullable().optional(),
  debtSituation: z.enum(["NONE", "STUDENT_LOAN", "CREDIT_CARD", "INFORMAL_DEBT"]).nullable().optional(),
  languagePref: z.enum(["ENGLISH", "TAGLISH"]).optional(),
});

export const incomeEntrySchema = z.object({
  source: z.string().min(1),
  type: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  note: z.string().max(500).optional(),
});

export const budgetSchema = z.object({
  income: z.number().positive("Income must be positive"),
});

export const quizResultSchema = z.object({
  result: z.enum(["YOLO", "CHILL", "PLAN", "MASTER"]),
});

export const expenseSchema = z.object({
  category: z.enum(["NEEDS", "WANTS", "SAVINGS"]),
  subcategory: z.string().min(1).max(100),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  note: z.string().max(500).optional(),
});

export const monthlyBudgetSchema = z.object({
  income: z.number().positive("Income must be positive"),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
});
