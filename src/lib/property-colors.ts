// Shared property color mapping — used for dashboard chips, submission rows, etc.
// Bright yellow for 胡桃, muted grey for 安平, neutral fallback for others.

export interface PropertyColorTokens {
  chipBg: string; // Tailwind arbitrary background
  chipFg: string; // text color class
  border: string; // border color class
  dot: string;    // small dot indicator
  short: string;  // short 2-char label
}

const walnut: PropertyColorTokens = {
  chipBg: "bg-[oklch(0.92_0.14_92)]",
  chipFg: "text-[oklch(0.30_0.07_70)]",
  border: "border-[oklch(0.82_0.14_92)]",
  dot: "bg-[oklch(0.78_0.16_92)]",
  short: "胡桃",
};

const anping: PropertyColorTokens = {
  chipBg: "bg-[oklch(0.92_0.01_250)]",
  chipFg: "text-[oklch(0.40_0.02_250)]",
  border: "border-[oklch(0.82_0.02_250)]",
  dot: "bg-[oklch(0.65_0.02_250)]",
  short: "安平",
};

const fallback: PropertyColorTokens = {
  chipBg: "bg-secondary",
  chipFg: "text-foreground",
  border: "border-border",
  dot: "bg-muted-foreground",
  short: "民宿",
};

export function propertyColors(propertyId: string): PropertyColorTokens {
  if (propertyId === "walnut") return walnut;
  if (propertyId === "anping9") return anping;
  return fallback;
}
