import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useChatStore, type ChatAuthor } from "@/lib/chat-store";

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Reusable chat panel used on both guest and owner sides.
 * Owners can toggle chat off from settings; when disabled, guests see the
 * message pointing them to the owner's external channels.
 */
export function ChatPanel({
  threadId,
  viewerRole,
  counterpartName,
  compact = false,
  fallbackNote,
}: {
  threadId: string;
  viewerRole: ChatAuthor;
  counterpartName: string;
  compact?: boolean;
  fallbackNote?: string;
}) {
  const enabled = useChatStore((s) => s.enabled);
  const allMessages = useChatStore((s) => s.messages);
  const markRead = useChatStore((s) => s.markRead);
  const send = useChatStore((s) => s.send);
  const messages = allMessages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(threadId, viewerRole);
  }, [threadId, viewerRole, messages.length, markRead]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  if (!enabled) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center text-xs text-muted-foreground">
        {fallbackNote ??
          "業者暫時關閉站內訊息，請透過提供的聯絡方式與業者聯繫。"}
      </div>
    );
  }

  const submit = () => {
    if (!input.trim()) return;
    send(threadId, viewerRole, input);
    setInput("");
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-[oklch(0.94_0.02_82)] bg-card ${
        compact ? "h-56" : "h-72"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-[oklch(0.94_0.02_82)] bg-secondary/40 px-3 py-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <p className="text-xs font-bold text-foreground">
          與 {counterpartName} 對話
        </p>
      </div>
      <div
        ref={listRef}
        className="flex-1 space-y-2 overflow-y-auto p-3 text-sm"
      >
        {messages.length === 0 ? (
          <p className="pt-8 text-center text-xs text-muted-foreground">
            尚無訊息，先打個招呼吧。
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.author === viewerRole;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p
                    className={`mt-0.5 text-[9px] opacity-70 ${
                      mine ? "text-right" : "text-left"
                    }`}
                  >
                    {fmtTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex items-center gap-1 border-t border-[oklch(0.94_0.02_82)] bg-card p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="輸入訊息…"
          className="min-w-0 flex-1 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs outline-none focus:border-primary focus:bg-card"
        />
        <button
          onClick={submit}
          disabled={!input.trim()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
          aria-label="送出"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Floating chat bubble for the guest side. Opens the panel in a popover.
 */
export function GuestChatBubble({
  threadId,
  counterpartName,
}: {
  threadId: string;
  counterpartName: string;
}) {
  const { enabled, unread } = useChatStore();
  const [open, setOpen] = useState(false);
  const badge = unread(threadId, "guest");
  if (!enabled) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-105"
        aria-label="與業者聯絡"
      >
        <MessageCircle className="h-5 w-5" />
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-foreground/30 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-white">站內訊息</span>
              <button
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-foreground shadow"
                aria-label="關閉"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ChatPanel
              threadId={threadId}
              viewerRole="guest"
              counterpartName={counterpartName}
            />
          </div>
        </div>
      )}
    </>
  );
}
