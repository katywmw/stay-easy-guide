import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatAuthor = "guest" | "owner";

export interface ChatMessage {
  id: string;
  threadId: string;
  author: ChatAuthor;
  text: string;
  createdAt: string;
  readByOwner?: boolean;
  readByGuest?: boolean;
}

interface ChatState {
  /** Whether the owner has enabled in-app chat. If false, guests see a note pointing to external channels. */
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  messages: ChatMessage[];
  send: (threadId: string, author: ChatAuthor, text: string) => void;
  markRead: (threadId: string, reader: ChatAuthor) => void;
  byThread: (threadId: string) => ChatMessage[];
  unread: (threadId: string, reader: ChatAuthor) => number;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      enabled: true,
      setEnabled: (v) => set({ enabled: v }),
      messages: [],
      send: (threadId, author, text) => {
        const t = text.trim();
        if (!t) return;
        const msg: ChatMessage = {
          id: uid(),
          threadId,
          author,
          text: t,
          createdAt: new Date().toISOString(),
          readByOwner: author === "owner",
          readByGuest: author === "guest",
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },
      markRead: (threadId, reader) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.threadId === threadId
              ? reader === "owner"
                ? { ...m, readByOwner: true }
                : { ...m, readByGuest: true }
              : m,
          ),
        })),
      byThread: (threadId) =>
        get()
          .messages.filter((m) => m.threadId === threadId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      unread: (threadId, reader) =>
        get().messages.filter(
          (m) =>
            m.threadId === threadId &&
            m.author !== reader &&
            (reader === "owner" ? !m.readByOwner : !m.readByGuest),
        ).length,
    }),
    { name: "walnut-chat-v1" },
  ),
);
