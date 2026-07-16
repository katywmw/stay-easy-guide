import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Type,
  Eraser,
} from "lucide-react";

/**
 * Lightweight contentEditable rich-text editor.
 *
 * Uses document.execCommand for basic formatting. Emits HTML on change.
 * Sanitize the output on render — see src/lib/sanitize-html.ts.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Sync external value → editor only when it diverges (avoid caret jumps).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  const setBlock = (tag: string) => exec("formatBlock", tag);

  const insertLink = () => {
    const url = prompt("輸入連結網址（含 https://）");
    if (!url) return;
    exec("createLink", url);
  };

  const btn =
    "grid h-8 w-8 place-items-center rounded-md text-foreground hover:bg-secondary active:bg-secondary/80";

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/40 p-1">
        <button type="button" onClick={() => setBlock("H1")} className={btn} title="大標題">
          <Heading1 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setBlock("H2")} className={btn} title="小標題">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setBlock("P")} className={btn} title="內文">
          <Type className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" onClick={() => exec("bold")} className={btn} title="粗體">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => exec("italic")} className={btn} title="斜體">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => exec("underline")} className={btn} title="底線">
          <Underline className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className={btn}
          title="項目符號"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className={btn}
          title="編號清單"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" onClick={insertLink} className={btn} title="插入連結">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec("removeFormat")}
          className={btn}
          title="清除格式"
        >
          <Eraser className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onBlur={() => onChange(ref.current?.innerHTML ?? "")}
        data-placeholder={placeholder ?? "輸入內容…"}
        className="prose-owner min-h-[280px] max-w-none px-4 py-3 text-sm leading-relaxed outline-none [&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)] [&_h1]:mb-3 [&_h1]:mt-2 [&_h1]:text-xl [&_h1]:font-black [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[oklch(0.45_0.13_75)] [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_p]:mb-2 [&_a]:text-primary [&_a]:underline"
      />
    </div>
  );
}
