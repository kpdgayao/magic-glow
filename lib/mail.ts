import Mailjet from "node-mailjet";

let mailjetClient: InstanceType<typeof Mailjet> | null = null;

function getMailjet() {
  if (!mailjetClient) {
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      throw new Error("Mailjet API keys not configured");
    }

    mailjetClient = new Mailjet({
      apiKey,
      apiSecret,
    });
  }
  return mailjetClient;
}

interface WelcomeProfile {
  name: string;
  financialGoal: string | null;
  hasEmergencyFund: string | null;
  debtSituation: string | null;
  employmentStatus: string | null;
}

interface BlogSuggestion {
  emoji: string;
  title: string;
  slug: string;
}

const BLOG_CATALOG: (BlogSuggestion & { goals: string[]; tags: string[] })[] = [
  {
    emoji: "🧾",
    title: "BIR Tax Guide for Filipino Content Creators",
    slug: "bir-tax-guide-content-creators",
    goals: ["GROW_CREATOR_INCOME"],
    tags: ["creator", "tax"],
  },
  {
    emoji: "💰",
    title: "The 50/30/20 Budget Rule for Irregular Income",
    slug: "50-30-20-budget-rule-irregular-income",
    goals: ["BUDGET_BETTER", "PAY_OFF_DEBT"],
    tags: ["budget"],
  },
  {
    emoji: "📊",
    title: "How to Track Your Creator Income Like a Pro",
    slug: "track-creator-income-like-a-pro",
    goals: ["GROW_CREATOR_INCOME", "BUDGET_BETTER"],
    tags: ["creator", "income"],
  },
  {
    emoji: "🛡️",
    title: "Where to Build Your Emergency Fund in the Philippines",
    slug: "build-emergency-fund-philippines",
    goals: ["SAVE_EMERGENCY_FUND"],
    tags: ["saving"],
  },
  {
    emoji: "🚨",
    title: "How to Spot Investment Scams on Social Media",
    slug: "spot-investment-scams-social-media",
    goals: ["START_INVESTING"],
    tags: ["safety"],
  },
  {
    emoji: "🤝",
    title: "Brand Deal Pricing Guide for Filipino Creators",
    slug: "brand-deal-pricing-guide-filipino-creators",
    goals: ["GROW_CREATOR_INCOME"],
    tags: ["creator", "income"],
  },
  {
    emoji: "📈",
    title: "Pag-IBIG MP2 vs Digital Bank Savings: Which is Better?",
    slug: "pagibig-mp2-vs-digital-bank-savings",
    goals: ["START_INVESTING", "SAVE_EMERGENCY_FUND"],
    tags: ["investing", "saving"],
  },
  {
    emoji: "📱",
    title: "GCash and Maya Tips Every Creator Should Know",
    slug: "gcash-maya-tips-every-creator-should-know",
    goals: ["BUDGET_BETTER", "GROW_CREATOR_INCOME"],
    tags: ["fintech"],
  },
  {
    emoji: "🚀",
    title: "How to Start Freelancing as a Content Creator",
    slug: "start-freelancing-content-creator-philippines",
    goals: ["GROW_CREATOR_INCOME"],
    tags: ["creator", "career"],
  },
  {
    emoji: "💡",
    title: "Why Financial Literacy Matters for Gen Z Creators",
    slug: "financial-literacy-gen-z-creators",
    goals: [],
    tags: ["general"],
  },
];

function pickBlogSuggestions(profile: WelcomeProfile): BlogSuggestion[] {
  const scored = BLOG_CATALOG.map((post) => {
    let score = 0;
    if (profile.financialGoal && post.goals.includes(profile.financialGoal)) {
      score += 10;
    }
    if (
      profile.hasEmergencyFund !== "YES" &&
      post.slug === "build-emergency-fund-philippines"
    ) {
      score += 5;
    }
    if (
      profile.debtSituation &&
      profile.debtSituation !== "NONE" &&
      post.tags.includes("budget")
    ) {
      score += 3;
    }
    if (
      profile.employmentStatus === "FULL_TIME_CREATOR" &&
      post.tags.includes("creator")
    ) {
      score += 3;
    }
    return { ...post, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick top 3, but ensure variety — always include the general literacy post if no strong matches
  const picks = scored.slice(0, 3);
  if (picks.every((p) => p.score === 0)) {
    // No profile-matched posts; use curated defaults
    return [
      BLOG_CATALOG[1], // 50/30/20 budget
      BLOG_CATALOG[3], // emergency fund
      BLOG_CATALOG[9], // financial literacy
    ];
  }
  return picks.map(({ emoji, title, slug }) => ({ emoji, title, slug }));
}

export async function sendWelcomeEmail(
  email: string,
  profile: WelcomeProfile
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const senderEmail =
    process.env.MAILJET_SENDER_EMAIL || "hello@moneyglow.app";
  const suggestions = pickBlogSuggestions(profile);

  const blogCardsHtml = suggestions
    .map(
      (post) => `
      <a href="${appUrl}/blog/${post.slug}" style="display: block; text-decoration: none; background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 12px; padding: 16px; margin-bottom: 10px; color: #F5F5F5;">
        <span style="font-size: 20px; margin-right: 10px;">${post.emoji}</span>
        <span style="font-size: 14px; font-weight: 600;">${post.title}</span>
      </a>`
    )
    .join("");

  const greeting = profile.name || "there";

  try {
    await getMailjet()
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: "MoneyGlow",
            },
            To: [{ Email: email }],
            Subject: `Welcome to MoneyGlow, ${profile.name || "Creator"}!`,
            HTMLPart: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0D0D0D; color: #F5F5F5;">
              <h1 style="font-size: 24px; color: #FF6B9D; margin-bottom: 8px;">MoneyGlow</h1>
              <p style="color: #999; font-size: 13px; margin-top: 0;">Your Financial Glow-Up Starts Here</p>
              <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;" />

              <p style="font-size: 16px; line-height: 1.6;">Hi ${greeting}! 👋</p>
              <p style="font-size: 15px; line-height: 1.6; color: #CCC;">
                Welcome to MoneyGlow! You're now part of a community of Filipino creators
                taking control of their finances.
              </p>

              <p style="font-size: 15px; line-height: 1.6; color: #CCC;">
                Here's what you can do next:
              </p>

              <div style="margin: 16px 0;">
                <p style="font-size: 13px; color: #FFB86C; font-weight: 600; margin-bottom: 10px;">📖 RECOMMENDED READS FOR YOU</p>
                ${blogCardsHtml}
              </div>

              <div style="margin: 24px 0;">
                <p style="font-size: 13px; color: #50E3C2; font-weight: 600; margin-bottom: 10px;">🚀 QUICK START</p>
                <table style="width: 100%; font-size: 14px; color: #CCC;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 6px 0;">💰 Log your first income entry</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">📋 Set up your monthly budget</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">💡 Get your personalized daily advice</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">🎯 Take the Money Personality Quiz</td>
                  </tr>
                </table>
              </div>

              <a href="${appUrl}/dashboard" style="display: inline-block; background: #FF6B9D; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 16px 0; font-size: 15px;">
                Go to Dashboard
              </a>

              <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;" />
              <p style="color: #666; font-size: 11px;">MoneyGlow — Powered by <a href="https://www.iol.ph" style="color: #FF6B9D; text-decoration: none;">IOL Inc.</a></p>
            </div>
            `,
          },
        ],
      });

    console.log(`[mail] Welcome email sent to ${email}`);
  } catch (error) {
    // Don't throw — welcome email failure shouldn't block onboarding
    console.error("[mail] Welcome email error:", error);
  }
}

export async function sendMagicLink(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicUrl = `${appUrl}/verify?token=${token}`;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL || "hello@moneyglow.app";

  console.log(`[mail] Sending magic link to ${email}, URL: ${magicUrl}`);

  try {
    const result = await getMailjet()
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: "MoneyGlow",
            },
            To: [{ Email: email }],
            Subject: "Your MoneyGlow Login Link",
            HTMLPart: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0D0D0D; color: #F5F5F5;">
              <h1 style="font-size: 24px; color: #FF6B9D; margin-bottom: 8px;">MoneyGlow</h1>
              <p style="color: #999; font-size: 13px; margin-top: 0;">Your Financial Glow-Up Starts Here</p>
              <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;" />
              <p style="font-size: 15px; line-height: 1.6;">Click the button below to sign in to your MoneyGlow account:</p>
              <a href="${magicUrl}" style="display: inline-block; background: #FF6B9D; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 16px 0; font-size: 15px;">
                Sign In to MoneyGlow
              </a>
              <p style="color: #666; font-size: 13px; margin-top: 24px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;" />
              <p style="color: #666; font-size: 11px;">MoneyGlow — Powered by <a href="https://www.iol.ph" style="color: #FF6B9D; text-decoration: none;">IOL Inc.</a></p>
            </div>
          `,
          },
        ],
      });

    console.log("[mail] Mailjet response:", JSON.stringify(result.body));
  } catch (error) {
    console.error("[mail] Mailjet error:", error);
    throw error;
  }
}
