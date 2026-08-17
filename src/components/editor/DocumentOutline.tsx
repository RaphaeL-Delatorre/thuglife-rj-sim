import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface OutlineItem {
  id: string;
  text: string;
  level: number;
  tag: string;
}

interface DocumentOutlineProps {
  html: string;
  onJumpTo: (itemText: string) => void;
  onInsertTOC: (tocHtml: string) => void;
  children?: React.ReactNode;
}

export function DocumentOutline({
  html,
  onJumpTo,
  onInsertTOC,
  children,
}: DocumentOutlineProps) {
  const items = useMemo<OutlineItem[]>(() => {
    if (!html) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6, .rc-callout-title, .rc-rule-code, summary");
    
    const result: OutlineItem[] = [];
    headings.forEach((el, index) => {
      const text = el.textContent?.trim() || `Seção ${index + 1}`;
      const tag = el.tagName.toLowerCase();
      let level = 1;
      if (tag === "h1") level = 1;
      else if (tag === "h2") level = 2;
      else if (tag === "h3") level = 3;
      else if (tag === "h4") level = 4;
      else if (tag === "h5" || tag === "h6") level = 5;
      else level = 3;

      result.push({
        id: `heading-${index}`,
        text,
        level,
        tag,
      });
    });

    return result;
  }, [html]);

  const handleGenerateTOC = () => {
    if (items.length === 0) return;
    const tocItems = items
      .map(
        (it) =>
          `<li style="margin-left:${(it.level - 1) * 1.2}rem; margin-bottom:0.35rem;">
            <span style="color:var(--primary);font-weight:700;">${it.level === 1 ? "📜" : it.level === 2 ? "▶" : "•"}</span> ${it.text}
          </li>`
      )
      .join("");

    const tocHtml = `
      <div class="rc-frame" style="border:1px solid #8b5cf6;border-radius:1rem;background:#8b5cf612;padding:1.2rem;margin:1.5rem 0;">
        <p class="rc-stat-title" style="color:#8b5cf6;font-size:0.9rem;font-weight:700;letter-spacing:0.1em;margin-bottom:0.6rem;text-transform:uppercase;">
          📚 Índice do Documento
        </p>
        <ul style="list-style:none;padding-left:0;margin:0;font-size:0.9rem;line-height:1.6;">
          ${tocItems}
        </ul>
      </div>
      <p><br></p>
    `;

    onInsertTOC(tocHtml);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            title="Índice e Estrutura do Documento"
            className="flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
          >
            📚
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-3 bg-popover/95 backdrop-blur border border-border shadow-2xl z-50"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <span>📚</span> Estrutura / Índice
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {items.length} tópicos
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {items.length > 0 ? (
              items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onJumpTo(it.text)}
                  style={{ paddingLeft: `${(it.level - 1) * 0.75 + 0.5}rem` }}
                  className="flex w-full items-center gap-1.5 rounded py-1 pr-2 text-left text-xs hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="text-[10px] text-primary opacity-60 group-hover:opacity-100 font-mono">
                    H{it.level}
                  </span>
                  <span className="truncate">{it.text}</span>
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Nenhum título ou seção encontrado. Adicione títulos (H1, H2) para gerar o índice.
              </div>
            )}
          </div>

          <div className="border-t border-border pt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={items.length === 0}
              onClick={handleGenerateTOC}
              className="w-full text-xs font-bold uppercase tracking-wider text-primary border-primary/40 hover:bg-primary/10"
            >
              + Inserir Índice no Texto
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
