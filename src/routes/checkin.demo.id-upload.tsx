import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { PrimaryButton } from "@/components/checkin/Fields";
import { FaqAccordion } from "@/components/checkin/FaqAccordion";
import { useCheckinStore } from "@/lib/checkin-store";
import { StepBar } from "./checkin.demo.booking";

export const Route = createFileRoute("/checkin/demo/id-upload")({
  component: IdUploadPage,
  head: () => ({ meta: [{ title: "上傳身分證件 · 胡桃民宿" }] }),
});

function IdUploadPage() {
  const nav = useNavigate();
  const s = useCheckinStore();
  const canNext = s.idUploaded && s.idConsent;

  return (
    <PhoneShell
      title="上傳身分證件"
      subtitle="步驟 3 / 6"
      backTo="/checkin/demo/guest-info"
    >
      <StepBar current={3} />

      <div className="mt-4">
        <h2 className="text-lg font-black text-foreground">上傳身分證件</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          請拍照或上傳入住代表人的證件資料，供民宿核對入住身分。
        </p>
      </div>

      {/* Upload placeholder */}
      <button
        type="button"
        onClick={() => s.update({ idUploaded: !s.idUploaded })}
        className={`card-soft mt-4 flex w-full flex-col items-center justify-center gap-3 border-2 border-dashed p-8 transition ${
          s.idUploaded ? "border-success bg-success-soft" : "border-primary/50"
        }`}
      >
        {s.idUploaded ? (
          <>
            {/* Simulated ID preview with diagonal watermark */}
            <div
              className="relative h-32 w-full overflow-hidden rounded-lg bg-[oklch(0.90_0.02_85)]"
              aria-label="watermarked ID preview"
            >
              <div className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-muted-foreground">
                身分證預覽（範例）
              </div>
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/70 mix-blend-overlay"
                style={{ transform: "rotate(-24deg)", textShadow: "0 1px 1px rgba(0,0,0,0.3)" }}
              >
                <div className="whitespace-nowrap leading-6">
                  僅供入住核對使用 · FOR VERIFICATION ONLY<br />
                  僅供入住核對使用 · FOR VERIFICATION ONLY<br />
                  僅供入住核對使用 · FOR VERIFICATION ONLY
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-sm font-bold text-foreground">已上傳並加浮水印</p>
            </div>
            <p className="text-xs text-muted-foreground">點擊可重新上傳</p>
          </>
        ) : (
          <>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft">
              <Camera className="h-6 w-6 text-foreground" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-bold text-foreground">拍照或選擇檔案</p>
            <p className="text-center text-xs text-muted-foreground">
              支援身分證、駕照、護照
              <br />
              （Demo：點擊模擬上傳）
            </p>
          </>
        )}
      </button>


      {/* Watermark notice */}
      <div className="mt-4 rounded-2xl border border-[oklch(0.88_0.06_85)] bg-warning-soft p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" />
          <p className="text-xs leading-relaxed text-foreground/80">
            為保護您的證件，上傳後將自動加上「
            <span className="font-bold">僅供入住核對使用 · For verification only</span>
            」浮水印，避免被挪作他用。
          </p>
        </div>
      </div>


      <div className="mt-4 rounded-2xl bg-secondary p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" />
          <p className="text-xs leading-relaxed text-foreground/80">
            您的證件資料僅作為本次入住身分確認使用，不會作為其他用途。
          </p>
        </div>
      </div>

      {/* Consent */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={s.idConsent}
          onChange={(e) => s.update({ idConsent: e.target.checked })}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[oklch(0.55_0.13_75)]"
        />
        <span className="text-sm text-foreground">
          我同意提供證件資料作為入住身分確認使用。
        </span>
      </label>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        完整入住指引與門鎖密碼將於民宿審核通過後開放。
      </p>

      <FaqAccordion category="id" title="常見問題（證件相關）" />

      <div className="mt-6">
        <PrimaryButton
          disabled={!canNext}
          onClick={() => nav({ to: "/checkin/demo/deposit" })}
        >
          下一步：押金資訊
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}
