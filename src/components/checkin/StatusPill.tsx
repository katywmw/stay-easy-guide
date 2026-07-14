import type { CheckinStatus, DepositStatus } from "@/lib/checkin-store";

type Tone = "success" | "warning" | "muted" | "destructive" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-[oklch(0.45_0.13_55)]",
  muted: "bg-secondary text-muted-foreground",
  destructive: "bg-destructive-soft text-destructive",
  primary: "bg-primary-soft text-foreground",
};

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "success"
            ? "bg-success"
            : tone === "warning"
              ? "bg-warning"
              : tone === "destructive"
                ? "bg-destructive"
                : tone === "primary"
                  ? "bg-primary"
                  : "bg-muted-foreground"
        }`}
      />
      {label}
    </span>
  );
}

export function checkinStatusPill(status: CheckinStatus) {
  switch (status) {
    case "draft":
      return { label: "尚未送出", tone: "muted" as const };
    case "submitted":
      return { label: "等待審核", tone: "warning" as const };
    case "need_more_info":
      return { label: "需補件", tone: "destructive" as const };
    case "approved":
      return { label: "已核准", tone: "success" as const };
    case "completed":
      return { label: "已完成", tone: "success" as const };
  }
}

export function depositPill(status: DepositStatus) {
  switch (status) {
    case "unpaid":
      return { label: "尚未支付", tone: "muted" as const };
    case "pending":
      return { label: "等待確認", tone: "warning" as const };
    case "confirmed":
      return { label: "已確認", tone: "success" as const };
  }
}
