import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Snapshot of the room info owners have sent to a guest.
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
  lastNotifiedAt: string;
  lastVersion: number;
  channel: "line" | "sms" | "email";
  snapshot: SentRoomSnapshot[];
  diffSummary: string;
  guestAcknowledgedAt: string | null;
}

/**
 * Owner-initiated request for the guest to re-submit something (ID photo,
 * payment proof, extra info). The guest sees it on the submitted page.
 */
export type ReissueField = "id" | "payment" | "other";

export interface ReissueRequest {
  submissionId: string;
  field: ReissueField;
  reason: string;
  message: string;
  requestedAt: string;
  resolvedAt: string | null;
}

/**
 * Timeline of what the guest has updated (after a reissue request or on their
 * own initiative). Read by the owner submission page.
 */
export interface GuestUpdateEntry {
  at: string;
  field: ReissueField;
  note?: string;
}

interface State {
  updates: Record<string, SubmissionUpdate>;
  reissue: Record<string, ReissueRequest | undefined>;
  guestUpdates: Record<string, GuestUpdateEntry[]>;
  lastSeenGuestUpdate: Record<string, string>;

  notify: (
    submissionId: string,
    snapshot: SentRoomSnapshot[],
    diffSummary: string,
    channel?: SubmissionUpdate["channel"],
  ) => SubmissionUpdate;
  acknowledge: (submissionId: string) => void;
  reset: (submissionId: string) => void;

  requestReissue: (r: Omit<ReissueRequest, "requestedAt" | "resolvedAt">) => void;
  resolveReissue: (submissionId: string) => void;

  markGuestUpdate: (submissionId: string, field: ReissueField, note?: string) => void;
  markSeen: (submissionId: string) => void;
}

export const useSubmissionUpdates = create<State>()(
  persist(
    (set, get) => ({
      updates: {},
      reissue: {},
      guestUpdates: {},
      lastSeenGuestUpdate: {},

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

      requestReissue: (r) =>
        set((s) => ({
          reissue: {
            ...s.reissue,
            [r.submissionId]: {
              ...r,
              requestedAt: new Date().toISOString(),
              resolvedAt: null,
            },
          },
        })),
      resolveReissue: (submissionId) =>
        set((s) => {
          const cur = s.reissue[submissionId];
          if (!cur) return s;
          return {
            reissue: {
              ...s.reissue,
              [submissionId]: { ...cur, resolvedAt: new Date().toISOString() },
            },
          };
        }),

      markGuestUpdate: (submissionId, field, note) =>
        set((s) => {
          const list = s.guestUpdates[submissionId] ?? [];
          return {
            guestUpdates: {
              ...s.guestUpdates,
              [submissionId]: [
                ...list,
                { at: new Date().toISOString(), field, note },
              ],
            },
          };
        }),
      markSeen: (submissionId) =>
        set((s) => ({
          lastSeenGuestUpdate: {
            ...s.lastSeenGuestUpdate,
            [submissionId]: new Date().toISOString(),
          },
        })),
    }),
    { name: "walnut-submission-updates-v2" },
  ),
);

export const reissueFieldLabels: Record<ReissueField, string> = {
  id: "身分證件",
  payment: "付款證明",
  other: "其他資料",
};

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
