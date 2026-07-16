import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SurchargeLine {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitAmount: number;
}

export type SurchargeStatus = "pending" | "paid" | "cancelled";

export interface SurchargeInvoice {
  id: string;
  submissionId: string;
  guestName: string;
  lines: SurchargeLine[];
  note: string;
  status: SurchargeStatus;
  createdAt: string;
}

interface SurchargeStoreState {
  invoices: SurchargeInvoice[];
  create: (
    inv: Omit<SurchargeInvoice, "id" | "createdAt" | "status">,
  ) => SurchargeInvoice;
  updateStatus: (id: string, status: SurchargeStatus) => void;
  remove: (id: string) => void;
  byId: (id: string) => SurchargeInvoice | undefined;
  bySubmission: (submissionId: string) => SurchargeInvoice[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useSurchargeStore = create<SurchargeStoreState>()(
  persist(
    (set, get) => ({
      invoices: [],
      create: (inv) => {
        const full: SurchargeInvoice = {
          ...inv,
          id: uid(),
          createdAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ invoices: [full, ...s.invoices] }));
        return full;
      },
      updateStatus: (id, status) =>
        set((s) => ({
          invoices: s.invoices.map((x) => (x.id === id ? { ...x, status } : x)),
        })),
      remove: (id) =>
        set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),
      byId: (id) => get().invoices.find((x) => x.id === id),
      bySubmission: (submissionId) =>
        get().invoices.filter((x) => x.submissionId === submissionId),
    }),
    { name: "walnut-surcharges-v1" },
  ),
);

export function surchargeTotal(inv: SurchargeInvoice): number {
  return inv.lines.reduce((s, l) => s + l.unitAmount * l.quantity, 0);
}
