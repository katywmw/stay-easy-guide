import { useEffect, useRef, useState } from "react";

/**
 * Simple manual-save form state. Track a draft locally; the caller writes to
 * the store only when `save()` is invoked.
 */
export function useDirtyForm<T>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const initialRef = useRef<T>(initial);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Re-sync when identity of `initial` changes (e.g. property switch)
  useEffect(() => {
    setDraft(initial);
    initialRef.current = initial;
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initialRef.current);

  const patch = (partial: Partial<T>) => setDraft((d) => ({ ...d, ...partial }));
  const set = (v: T) => setDraft(v);
  const reset = () => setDraft(initialRef.current);
  const markSaved = () => {
    initialRef.current = draft;
    setSavedAt(new Date());
  };

  return { draft, patch, set, reset, dirty, savedAt, markSaved };
}
