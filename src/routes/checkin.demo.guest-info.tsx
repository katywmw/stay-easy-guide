import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import {
  ChipGroup,
  PrimaryButton,
  TextArea,
  TextField,
  SelectField,
} from "@/components/checkin/Fields";
import { useCheckinStore } from "@/lib/checkin-store";
import { usePropertySettings } from "@/lib/property-settings";
import { StepBar } from "./checkin.demo.booking";

export const Route = createFileRoute("/checkin/demo/guest-info")({
  component: GuestInfoPage,
  head: () => ({ meta: [{ title: "入住人資訊 · 胡桃民宿" }] }),
});

function GuestInfoPage() {
  const nav = useNavigate();
  const s = useCheckinStore();
  const { askParking, askPet } = usePropertySettings();
  const canNext =
    s.guestCount &&
    s.arrivalTime &&
    (!askPet || s.hasPet) &&
    (!askParking || s.needParking);

  return (
    <PhoneShell
      title="入住人資訊"
      subtitle="步驟 2 / 5"
      backTo="/checkin/demo/booking"
    >
      <StepBar current={2} />

      <div className="card-soft mt-4 p-4">
        <SelectField
          label="入住人數"
          value={s.guestCount}
          onChange={(e) => s.update({ guestCount: e.target.value })}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} 人
            </option>
          ))}
        </SelectField>

        <TextField
          label="預計抵達時間"
          type="time"
          value={s.arrivalTime}
          onChange={(e) => s.update({ arrivalTime: e.target.value })}
        />

        {askPet && (
          <ChipGroup<"yes" | "no">
            label="是否攜帶寵物"
            value={s.hasPet}
            onChange={(v) => s.update({ hasPet: v })}
            options={[
              { value: "yes", label: "是" },
              { value: "no", label: "否" },
            ]}
          />
        )}

        {askParking && (
          <ChipGroup<"yes" | "no">
            label="是否需要停車資訊"
            value={s.needParking}
            onChange={(v) => s.update({ needParking: v })}
            options={[
              { value: "yes", label: "是" },
              { value: "no", label: "否" },
            ]}
          />
        )}

        <TextArea
          label="特殊需求備註"
          placeholder="例如：加床、寵物、寄放行李、素食早餐…"
          value={s.specialNotes}
          hint="若有加床、寵物、提早寄放行李等需求，請於備註中告知。"
          onChange={(e) => s.update({ specialNotes: e.target.value })}
        />
      </div>

      <div className="mt-6">
        <PrimaryButton
          disabled={!canNext}
          onClick={() => nav({ to: "/checkin/demo/id-upload" })}
        >
          下一步：上傳證件
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}
