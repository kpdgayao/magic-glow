import { ImageResponse } from "next/og";

export const alt = "MoneyGlow Money Personality Quiz Result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RESULTS: Record<
  string,
  { title: string; emoji: string; color: string; desc: string }
> = {
  YOLO: {
    title: "The YOLO Spender",
    emoji: "\u{1F483}",
    color: "#FF6B9D",
    desc: "You live for the moment!",
  },
  CHILL: {
    title: "The Chill Saver",
    emoji: "\u{1F60E}",
    color: "#FFB86C",
    desc: "You have basic money awareness but no real system.",
  },
  PLAN: {
    title: "The Planner",
    emoji: "\u{1F4CB}",
    color: "#6C9CFF",
    desc: "You think ahead and make smart choices.",
  },
  MASTER: {
    title: "The Money Master",
    emoji: "\u{1F451}",
    color: "#50E3C2",
    desc: "You track, plan, and protect your money like a pro.",
  },
};

export default async function Image({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const upperType = type?.toUpperCase() || "YOLO";
  const data = RESULTS[upperType] || RESULTS.YOLO;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0D0D0D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Gradient accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(to right, ${data.color}, ${data.color}88)`,
          }}
        />

        {/* MoneyGlow branding */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 40,
            fontSize: 24,
            fontWeight: 700,
            color: "#FF6B9D",
          }}
        >
          MoneyGlow
        </div>

        {/* Quiz badge */}
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 40,
            fontSize: 16,
            color: "#999",
            background: "#1A1A1A",
            border: "1px solid #2A2A2A",
            borderRadius: 20,
            padding: "6px 16px",
          }}
        >
          Money Personality Quiz
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 96, marginBottom: 16 }}>{data.emoji}</div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: data.color,
            marginBottom: 12,
          }}
        >
          {data.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: "#CCCCCC",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {data.desc}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 40,
            background: data.color,
            color: "#0D0D0D",
            borderRadius: 16,
            padding: "14px 40px",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {"What's your money personality?"}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 16,
            color: "#666666",
          }}
        >
          moneyglow.app
        </div>
      </div>
    ),
    { ...size }
  );
}
