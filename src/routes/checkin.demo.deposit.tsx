import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload, Info, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { PrimaryButton, ChipGroup } from "@/components/checkin/Fields";
import { FaqAccordion } from "@/components/checkin/FaqAccordion";
import { useCheckinStore } from "@/lib/checkin-store";
import { StepBar } from "./checkin.demo.booking";
import { depositPill, StatusPill } from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/checkin/demo/deposit")({
  component: DepositPage,
  head: () => ({ meta: [{ title: "押金資訊 · 胡桃民宿" }] }),
});

function DepositPage() {
  const nav = useNavigate();
  const s = useCheckinStore();
  const canNext = !!s.depositMethod;
  const pill = depositPill(s.depositStatus);

  return (
    <PhoneShell
      title="押金資訊"
      subtitle="步驟 4 / 6"
      backTo="/checkin/demo/id-upload"
    >
      <StepBar current={4} />

      {/* Deposit amount card */}
      <div
        className="mt-4 overflow-hidden rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.94 0.06 90) 0%, oklch(0.90 0.10 82) 100%)",
        }}
      >
        <p className="text-xs font-semibold text-foreground/70">押金金額</p>
        <p className="mt-1 text-3xl font-black text-foreground">NT$ 1,000</p>
        <div className="mt-3">
          <StatusPill label={pill.label} tone={pill.tone} />
        </div>
      </div>

      <div className="card-soft mt-4 p-4">
        <ChipGroup<string>
          label="付款方式"
          value={s.depositMethod}
          onChange={(v) => s.update({ depositMethod: v })}
          options={[
            { value: "transfer", label: "銀行匯款" },
            { value: "linepay", label: "LINE Pay" },
            { value: "onsite", label: "現場支付" },
          ]}
        />

        {s.depositMethod === "transfer" && (
          <div className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-foreground/80">
            <p className="font-bold">匯款帳號（範例）</p>
            <p className="mt-1">胡桃國際商銀 (013)</p>
            <p>帳號：1234-5678-9012（Demo）</p>
            <p className="mt-1">戶名：胡桃民宿有限公司</p>
          </div>
        )}
        {s.depositMethod === "linepay" && (
          <div className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-foreground/80">
            <p className="font-bold">LINE Pay 收款（Demo）</p>
            <p className="mt-1">請至 LINE 訊息中點擊民宿發送之 LINE Pay 連結完成付款。</p>
          </div>
        )}
        {s.depositMethod === "onsite" && (
          <div className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-foreground/80">
            <p className="font-bold">現場支付</p>
            <p className="mt-1">入住當日於現場以現金或行動支付方式繳交押金。</p>
          </div>
        )}
      </div>

      {/* Proof upload */}
      <button
        type="button"
        onClick={() =>
          s.update({
            depositProofUploaded: !s.depositProofUploaded,
            depositStatus: !s.depositProofUploaded ? "pending" : "unpaid",
          })
        }
        className={`card-soft mt-4 flex w-full items-center gap-3 border-2 border-dashed p-5 transition ${
          s.depositProofUploaded ? "border-success bg-success-soft" : "border-primary/50"
        }`}
      >
        {s.depositProofUploaded ? (
          <>
            <CheckCircle2 className="h-8 w-8 shrink-0 text-success" />
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-foreground">已上傳付款證明</p>
              <p className="text-xs text-muted-foreground">狀態：等待民宿確認</p>
            </div>
          </>
        ) : (
          <>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
              <Upload className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-foreground">上傳付款證明</p>
              <p className="text-xs text-muted-foreground">Demo：點擊模擬上傳</p>
            </div>
          </>
        )}
      </button>

      <div className="mt-4 rounded-2xl border border-[oklch(0.88_0.06_85)] bg-warning-soft p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" />
          <p className="text-xs leading-relaxed text-foreground/80">
            請依照民宿提供的方式完成押金支付，並上傳付款證明。民宿將於確認後更新狀態。
            <br />
            <span className="mt-1 block">押金將於退房檢查無誤後依民宿規定退還。</span>
          </p>
        </div>
      </div>

      <FaqAccordion category="deposit" title="常見問題（押金相關）" />

      <div className="mt-6">
        <PrimaryButton
          disabled={!canNext}
          onClick={() => nav({ to: "/checkin/demo/faq" })}
        >
          下一步：常見問題與入住須知
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}
