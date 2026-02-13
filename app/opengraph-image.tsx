import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MoneyGlow — Financial Literacy for Filipino Creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
            background: "linear-gradient(to right, #FF6B9D, #FFB86C, #50E3C2)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#FF6B9D",
            marginBottom: 16,
          }}
        >
          MoneyGlow
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#F5F5F5",
            marginBottom: 12,
          }}
        >
          Your Financial Glow-Up Starts Here
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "#999999",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Free financial literacy app for young Filipino digital creators
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Budget", "Track Income", "AI Advice", "Insights"].map((f) => (
            <div
              key={f}
              style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: 24,
                padding: "10px 24px",
                fontSize: 18,
                color: "#F5F5F5",
              }}
            >
              {f}
            </div>
          ))}
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
          moneyglow.app — Powered by IOL Inc.
        </div>
      </div>
    ),
    { ...size }
  );
}
