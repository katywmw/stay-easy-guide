import { Building2 } from "lucide-react";
import { usePropertyConfig } from "@/lib/property-config";

/** Prominent "you are editing: X" pill for settings pages. */
export function PropertyBadge() {
  const { properties, currentPropertyId } = usePropertyConfig();
  const p = properties.find((x) => x.id === currentPropertyId);
  if (!p) return null;
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary bg-primary-soft/80 px-3 py-1.5 text-xs font-bold text-foreground">
      <Building2 className="h-3.5 w-3.5" />
      正在編輯：{p.name}
    </div>
  );
}
