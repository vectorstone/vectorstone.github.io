export function normalizeObsidianMarkdown(markdown: string) {
  return markdown
    .replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_, target: string) => {
      const alt = target.split('/').pop() || target;
      return `![${alt}](${target})`;
    })
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target: string, label?: string) => {
      const text = label || target;
      return text;
    })
    .replace(/^>\s*\[!(\w+)\][+-]?\s*(.*)$/gm, (_, kind: string, title: string) => {
      const heading = title || kind.toUpperCase();
      return `> **${heading}**`;
    });
}
