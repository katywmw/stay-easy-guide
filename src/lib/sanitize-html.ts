/**
 * Minimal HTML sanitizer for the rich-text editor output. Allowlists a small
 * set of tags/attributes so we can safely render user-authored house-rules
 * content with `dangerouslySetInnerHTML`.
 */

const ALLOWED_TAGS = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U",
  "H1", "H2", "H3", "UL", "OL", "LI", "A", "DIV", "SPAN",
]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(["href", "target", "rel"]),
};

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  const template = document.createElement("template");
  template.innerHTML = html;
  clean(template.content);
  return template.innerHTML;
}

function clean(node: Node) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName;
      if (!ALLOWED_TAGS.has(tag)) {
        // Unwrap: keep children, drop the tag itself
        while (el.firstChild) node.insertBefore(el.firstChild, el);
        node.removeChild(el);
        continue;
      }
      // Strip disallowed attributes
      const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
      for (const attr of Array.from(el.attributes)) {
        if (!allowed.has(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        }
      }
      // href hygiene
      if (tag === "A") {
        const href = el.getAttribute("href") ?? "";
        if (!/^(https?:|mailto:|tel:)/i.test(href)) {
          el.removeAttribute("href");
        } else {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
      }
      clean(el);
    } else if (child.nodeType === Node.COMMENT_NODE) {
      node.removeChild(child);
    }
  }
}

/** Detect if a string is HTML (from rich-text editor) vs Markdown/plain. */
export function looksLikeHtml(s: string): boolean {
  return /<(p|h1|h2|h3|ul|ol|li|br|strong|b|em|i|u|a)[\s>/]/i.test(s);
}
