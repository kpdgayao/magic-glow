import Mailjet from "node-mailjet";

let mailjet: ReturnType<typeof Mailjet.prototype.post> extends never
  ? never
  : Mailjet;

function getMailjet() {
  if (!mailjet) {
    mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY!,
      apiSecret: process.env.MAILJET_SECRET_KEY!,
    });
  }
  return mailjet;
}

export async function sendMagicLink(email: string, token: string) {
  const magicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  await getMailjet()
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL!,
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
            <p style="color: #666; font-size: 11px;">MoneyGlow — BFBL x L'Oreal x DTI x SPARK! Philippines</p>
          </div>
        `,
        },
      ],
    });
}
