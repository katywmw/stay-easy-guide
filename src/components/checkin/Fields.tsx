import type { LabelHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

export function FieldLabel({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className="mb-1.5 block text-sm font-semibold text-foreground"
    >
      {children}
    </label>
  );
}

export function TextField({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...props}
        className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        rows={3}
        {...props}
        className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: { label: string; hint?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <select
        {...props}
        className="w-full appearance-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
      >
        {children}
      </select>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ChipGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={
                active
                  ? "rounded-full border-2 border-primary bg-primary-soft px-4 py-2 text-sm font-semibold text-foreground"
                  : "rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.75_0.14_85_/_0.6)] transition active:scale-[0.98] disabled:opacity-50 " +
        (props.className ?? "")
      }
    />
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "w-full rounded-2xl border border-border bg-card px-6 py-4 text-base font-semibold text-foreground transition active:scale-[0.98] " +
        (props.className ?? "")
      }
    />
  );
}
