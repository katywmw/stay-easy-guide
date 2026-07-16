import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Snapshot of the room info owners have sent to a guest. Used to detect drift
 * whenever passwords / room numbers change, and to prompt a re-send flow.
 * Demo/frontend only — no backend.
 */
export interface SentRoomSnapshot {
  roomId: string;
  roomNumber: string;
  displayName: string;
  doorPassword: string;
  gatePassword: string;
}

export interface SubmissionUpdate {
  submissionId: string;
  lastNotifiedAt: string;         // ISO
  lastVersion: number;
  channel: "line" | "sms" | "email";
  snapshot: SentRoomSnapshot[];
  diffSummary: string;
  guestAcknowledgedAt: string | null;
}

interface State {
  updates: Record<string, SubmissionUpdate>;
  notify: (
    submissionId: string,
    snapshot: SentRoomSnapshot[],
    diffSummary: string,
    channel?: SubmissionUpdate["channel"],
  ) => SubmissionUpdate;
  acknowledge: (submissionId: string) => void;
  reset: (submissionId: string) => void;
  get: (submissionId: string) => SubmissionUpdate | undefined;
}

export const useSubmissionUpdates = create<State>()(
  persist(
    (set, get) => ({
      updates: {},
      notify: (submissionId, snapshot, diffSummary, channel = "line") => {
        const prev = get().updates[submissionId];
        const next: SubmissionUpdate = {
          submissionId,
          lastNotifiedAt: new Date().toISOString(),
          lastVersion: (prev?.lastVersion ?? 0) + 1,
          channel,
          snapshot,
          diffSummary,
          guestAcknowledgedAt: null,
        };
        set((s) => ({ updates: { ...s.updates, [submissionId]: next } }));
        return next;
      },
      acknowledge: (submissionId) =>
        set((s) => {
          const cur = s.updates[submissionId];
          if (!cur || cur.guestAcknowledgedAt) return s;
          return {
            updates: {
              ...s.updates,
              [submissionId]: {
                ...cur,
                guestAcknowledgedAt: new Date().toISOString(),
              },
            },
          };
        }),
      reset: (submissionId) =>
        set((s) => {
          const n = { ...s.updates };
          delete n[submissionId];
          return { updates: n };
        }),
      get: (submissionId) => get().updates[submissionId],
    }),
    { name: "walnut-submission-updates-v1" },
  ),
);

export function snapshotEqual(
  a: SentRoomSnapshot[],
  b: SentRoomSnapshot[],
): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(a.map((r) => [r.roomId, r]));
  for (const r of b) {
    const other = byId.get(r.roomId);
    if (!other) return false;
    if (
      other.roomNumber !== r.roomNumber ||
      other.displayName !== r.displayName ||
      other.doorPassword !== r.doorPassword ||
      other.gatePassword !== r.gatePassword
    )
      return false;
  }
  return true;
}

export function diffSnapshots(
  prev: SentRoomSnapshot[],
  next: SentRoomSnapshot[],
): string {
  const prevById = new Map(prev.map((r) => [r.roomId, r]));
  const parts: string[] = [];
  for (const r of next) {
    const p = prevById.get(r.roomId);
    if (!p) {
      parts.push(`新增 ${r.displayName || r.roomNumber}`);
      continue;
    }
    if (p.roomNumber !== r.roomNumber || p.displayName !== r.displayName) {
      parts.push(
        `${p.displayName || p.roomNumber} → ${r.displayName || r.roomNumber}`,
      );
    }
    if (p.doorPassword !== r.doorPassword) {
      parts.push(
        `房門密碼 ${p.doorPassword || "—"} → ${r.doorPassword || "—"}`,
      );
    }
    if (p.gatePassword !== r.gatePassword) {
      parts.push(
        `大門密碼 ${p.gatePassword || "—"} → ${r.gatePassword || "—"}`,
      );
    }
  }
  return parts.join("、") || "資訊已更新";
}
