import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { PrimaryButton } from "@/components/checkin/Fields";
import { useCheckinStore } from "@/lib/checkin-store";
import { houseRulesText } from "@/lib/checkin-content";

export const Route = createFileRoute("/checkin/demo/house-rules")({
  component: HouseRulesPage,
  head: () => ({ meta: [{ title: "入住須知 · 胡桃民宿" }] }),
});

function HouseRulesPage() {
  const nav = useNavigate();
  const s = useCheckinStore();

  const blocks = parseMd(houseRulesText);

  return (
    <PhoneShell title="入住須知" backTo="/checkin/demo/faq">
      <div className="card-soft p-5">
        {blocks.map((b, i) => {
          if (b.type === "h1") {
            return (
              <h1
                key={i}
                className="mb-3 text-2xl font-black text-foreground"
              >
                {b.text}
              </h1>
            );
          }
          if (b.type === "h2") {
            return (
              <h2
                key={i}
                className="mb-2 mt-5 text-base font-bold text-[oklch(0.45_0.13_75)]"
              >
                {b.text}
              </h2>
            );
          }
          if (b.type === "ol") {
            return (
              <ol
                key={i}
                className="mb-3 space-y-1.5 text-sm leading-relaxed text-foreground/85"
              >
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="shrink-0 font-semibold text-muted-foreground">
                      {j + 1}.
                    </span>
                    <span className="min-w-0">{it}</span>
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <p
              key={i}
              className="mb-3 text-sm leading-relaxed text-foreground/85"
            >
              {b.text}
            </p>
          );
        })}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={s.rulesAgreed}
          onChange={(e) => s.update({ rulesAgreed: e.target.checked })}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[oklch(0.55_0.13_75)]"
        />
        <span className="text-sm font-semibold text-foreground">
          我已閱讀並同意遵守入住須知。
        </span>
      </label>

      <div className="mt-6">
        <PrimaryButton
          disabled={!s.rulesAgreed}
          onClick={() => nav({ to: "/checkin/demo/review" })}
        >
          下一步：檢查資料
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ol"; items: string[] };

function parseMd(src: string): Block[] {
  const lines = src.split("\n");
  const blocks: Block[] = [];
  let ol: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushOl = () => {
    if (ol.length) {
      blocks.push({ type: "ol", items: ol });
      ol = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushOl();
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      flushOl();
      blocks.push({ type: "h1", text: line.slice(2) });
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushOl();
      blocks.push({ type: "h2", text: line.slice(3) });
      continue;
    }
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushPara();
      ol.push(olMatch[2]);
      continue;
    }
    flushOl();
    para.push(line);
  }
  flushPara();
  flushOl();
  return blocks;
}
