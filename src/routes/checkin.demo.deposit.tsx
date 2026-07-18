import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Upload, Info, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { PrimaryButton, ChipGroup } from "@/components/checkin/Fields";

import { useCheckinStore } from "@/lib/checkin-store";
import { usePropertySettings } from "@/lib/property-settings";
import { usePropertyConfig, computeDeposit } from "@/lib/property-config";
import { StepBar } from "./checkin.demo.booking";
import { depositPill, StatusPill } from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/checkin/demo/deposit")({
  component: DepositPage,
  head: () => ({ meta: [{ title: "押金資訊 · 胡桃民宿" }] }),
});

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 1;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  const n = Math.round(ms / 86400000);
  return n > 0 ? n : 1;
}

function DepositPage() {
  const nav = useNavigate();
  const s = useCheckinStore();
  const settings = usePropertySettings();
  const config = usePropertyConfig();
  const pill = depositPill(s.depositStatus);

  const nights = nightsBetween(s.checkInDate, s.checkOutDate);
  const deposit = computeDeposit(config, s.selectedRoomIds);
  const petFee =
    settings.petFeeEnabled && s.hasPet === "yes" && settings.petFeePerNight > 0
      ? settings.petFeePerNight * nights
      : 0;
  const total = deposit + petFee;
  const fmt = (n: number) => `NT$ ${n.toLocaleString()}`;

  const selectedRooms = config.rooms.filter((r) => s.selectedRoomIds.includes(r.id));

  // Auto-skip when nothing to charge
  useEffect(() => {
    if (total === 0) {
      s.update({ depositStatus: "confirmed", depositMethod: "none" });
    }
  }, [total]);

  if (total === 0) {
    return (
      <PhoneShell
        title="押金資訊"
        subtitle="步驟 4 / 5"
        backTo="/checkin/demo/id-upload"
      >
        <StepBar current={4} />
        <div className="mt-4 rounded-3xl bg-success-soft p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <p className="mt-3 text-lg font-black text-foreground">本次無需支付押金</p>
          <p className="mt-1 text-xs text-foreground/70">
            民宿設定此訂單為免押金，可直接進入下一步。
          </p>
        </div>
        <div className="mt-6">
          <PrimaryButton onClick={() => nav({ to: "/checkin/demo/house-rules" })}>
            下一步:常見問題與入住須知
          </PrimaryButton>
        </div>
      </PhoneShell>
    );
  }

  const canNext = !!s.depositMethod;

  return (
    <PhoneShell
      title="押金資訊"
      subtitle="步驟 4 / 5"
      backTo="/checkin/demo/id-upload"
    >
      <StepBar current={4} />

      {/* Fee breakdown card */}
      <div
        className="mt-4 overflow-hidden rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.94 0.06 90) 0%, oklch(0.90 0.10 82) 100%)",
        }}
      >
        <p className="text-xs font-semibold text-foreground/70">應付金額</p>
        <div className="mt-2 space-y-1.5 text-sm text-foreground/85">
          {config.depositMode === "perRoom" && selectedRooms.length > 0 ? (
            selectedRooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <span>押金 · {r.name}</span>
                <span className="font-semibold [font-variant-numeric:tabular-nums]">
                  {fmt(r.depositAmount)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between">
              <span>押金</span>
              <span className="font-semibold [font-variant-numeric:tabular-nums]">
                {fmt(deposit)}
              </span>
            </div>
          )}
          {petFee > 0 && (
            <div className="flex items-center justify-between">
              <span>寵物費（{settings.petFeePerNight} × {nights} 晚）</span>
              <span className="font-semibold [font-variant-numeric:tabular-nums]">{fmt(petFee)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-foreground/15 pt-3">
          <span className="text-xs font-semibold text-foreground/70">合計</span>
          <span className="text-3xl font-black text-foreground [font-variant-numeric:tabular-nums]">{fmt(total)}</span>
        </div>
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
          <div className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-foreground/80 [font-variant-numeric:tabular-nums]">
            <p className="font-bold">匯款帳號</p>
            <p className="mt-1">{config.payment.bankName}（{config.payment.bankCode}）</p>
            <p>帳號：{config.payment.accountNumber}</p>
            <p className="mt-1">戶名：{config.payment.accountName}</p>
            {config.payment.notes && (
              <p className="mt-1 opacity-80">{config.payment.notes}</p>
            )}
          </div>
        )}
        {s.depositMethod === "linepay" && (
          <div className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-foreground/80">
            <p className="font-bold">LINE Pay 收款</p>
            {config.payment.linePayQrDataUrl ? (
              <div className="mt-2 flex flex-col items-center gap-2">
                <img
                  src={config.payment.linePayQrDataUrl}
                  alt="LINE Pay 收款 QR"
                  className="h-48 w-48 rounded-lg border border-border bg-card object-contain p-2"
                />
                <p className="text-center">請以 LINE Pay 掃描上方 QR Code 完成付款。</p>
              </div>
            ) : (
              <p className="mt-1">
                業者尚未上傳 LINE Pay 收款 QR，請改用其他方式或聯繫民宿。
              </p>
            )}
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

      <div className="mt-6">
        <PrimaryButton
          disabled={!canNext}
          onClick={() => nav({ to: "/checkin/demo/house-rules" })}
        >
          下一步：入住須知
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}
