import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/* ── Presets ─────────────────────────────────────────────────────────── */

const FONTS = [
  { label: "Padrão do site", value: "" },
  { label: "Barlow", value: "Barlow, system-ui, sans-serif" },
  { label: "Anton (títulos)", value: "Anton, Arial Black, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Impact", value: "Impact, sans-serif" },
];

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px", "48px"];

const BLOCKS = [
  { label: "Parágrafo", value: "p" },
  { label: "Título 1", value: "h1" },
  { label: "Título 2", value: "h2" },
  { label: "Título 3", value: "h3" },
  { label: "Título 4", value: "h4" },
  { label: "Código", value: "pre" },
];

const LINE_HEIGHTS = ["1", "1.25", "1.5", "1.75", "2", "2.5"];
const PARAGRAPH_SPACING = ["0px", "4px", "8px", "12px", "16px", "24px", "32px"];

const COLORS = [
  "#ffffff", "#e5e5e5", "#a1a1aa", "#71717a", "#000000",
  "#ef4444", "#dc2626", "#b91c1c", "#f97316", "#f59e0b",
  "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6",
  "#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e",
];

const EMOJIS = [
  "🔴","⚠️","🚨","✅","☑️","❌","⛔","🚫","📌","📍","🔗","🔍","🎯","💥","🔥","⭐","✨","💎","🏆","🎖️",
  "👮","🚓","🚔","🚑","🏥","🔫","💰","💵","💳","🕵️","🧨","🥊","🚗","🏍️","🛥️","✈️","🏠","🏢","🏦","⏰",
  "⏳","📅","📖","📝","📢","💬","🗣️","🤝","🙏","👊","👍","👎","🧠","💀","☠️","🩸","🎭","🎮","🎧","🎬",
];

const BULLETS = [
  "•","·","⊛","◉","○","◌","◍","◎","●","◘","◦","☉","⁃","⁌","⁍","◆","◇","◈","★","☆",
  "■","□","☐","☑","☒","✓","✔","❥","❧","☙","☸","✤","✱","✲","↠","↣","↦","↬","⇛","⇝",
  "⇢","⇨","➙","➛","➜","➝","➞","➟","➠","➡","➢","➣","➤","➥","➦","➧","➨","➮","➱","➲",
  "➳","➵","➸","➼","➽","➾","→","⇾","⇒","‣","▶","▷","▸","▹","►","▻",
];

const ALIGNMENTS = [
  { label: "Alinhar à esquerda", value: "justifyLeft" },
  { label: "Alinhar no centro", value: "justifyCenter" },
  { label: "Alinhar à direita", value: "justifyRight" },
  { label: "Justificar", value: "justifyFull" },
  { label: "Aumentar recuo", value: "indent" },
  { label: "Diminuir recuo", value: "outdent" },
];


/* ── Helpers ─────────────────────────────────────────────────────────── */

type SelectionState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  ul: boolean;
  ol: boolean;
  left: boolean;
  center: boolean;
  right: boolean;
  justify: boolean;
};

const EMPTY_STATE: SelectionState = {
  bold: false, italic: false, underline: false, strike: false,
  ul: false, ol: false, left: false, center: false, right: false, justify: false,
};

function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return url;
}

/* ── Toolbar primitives ──────────────────────────────────────────────── */

function TB({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TBSelect({
  value,
  onChange,
  options,
  title,
  width = "9rem",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  title: string;
  width?: string;
}) {
  return (
    <select
      title={title}
      aria-label={title}
      value={value}
      onMouseDown={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      style={{ width }}
      className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-border" />;
}

function ColorMenu({
  label,
  title,
  onPick,
}: {
  label: React.ReactNode;
  title: string;
  onPick: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <TB title={title} onClick={() => setOpen((o) => !o)}>
        {label}
      </TB>
      {open && (
        <div className="absolute left-0 top-9 z-50 w-[13rem] rounded-lg border border-border bg-popover p-2 shadow-xl">
          <div className="grid grid-cols-5 gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(c);
                  setOpen(false);
                }}
                className="h-7 w-7 rounded border border-border"
                style={{ background: c }}
              />
            ))}
          </div>
          <input
            type="color"
            aria-label="Cor personalizada"
            className="mt-2 h-8 w-full cursor-pointer rounded border border-border bg-background"
            onChange={(e) => {
              onPick(e.target.value);
              setOpen(false);
            }}
          />
        </div>
      )}
    </span>
  );
}

/** Menu com duas cores: preenchimento e traçado (borda). */
function FillStrokeMenu({
  label,
  title,
  defaultFill,
  defaultStroke,
  onApply,
}: {
  label: React.ReactNode;
  title: string;
  defaultFill: string;
  defaultStroke: string;
  onApply: (fill: string, stroke: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [fill, setFill] = useState(defaultFill);
  const [stroke, setStroke] = useState(defaultStroke);

  const row = (current: string, set: (v: string) => void) => (
    <div className="mt-1 grid grid-cols-10 gap-1">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => set(c)}
          className={`h-5 w-5 rounded border ${current === c ? "border-primary ring-1 ring-primary" : "border-border"}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );

  return (
    <span className="relative">
      <TB title={title} onClick={() => setOpen((o) => !o)}>
        {label}
      </TB>
      {open && (
        <div className="absolute left-0 top-9 z-50 w-[16rem] rounded-lg border border-border bg-popover p-3 shadow-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Cor do preenchimento
          </p>
          {row(fill, setFill)}
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              aria-label="Preenchimento personalizado"
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              className="h-7 w-16 cursor-pointer rounded border border-border bg-background"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFill("transparent")}
              className="rounded border border-border px-2 py-1 text-[11px] hover:bg-secondary"
            >
              Sem preenchimento
            </button>
          </div>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Cor do traçado (borda)
          </p>
          {row(stroke, setStroke)}
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              aria-label="Traçado personalizado"
              value={stroke}
              onChange={(e) => setStroke(e.target.value)}
              className="h-7 w-16 cursor-pointer rounded border border-border bg-background"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setStroke("transparent")}
              className="rounded border border-border px-2 py-1 text-[11px] hover:bg-secondary"
            >
              Sem traçado
            </button>
          </div>

          <div
            className="mt-3 rounded-xl border px-3 py-2 text-xs"
            style={{ background: fill, borderColor: stroke }}
          >
            Pré-visualização da moldura
          </div>

          <Button
            type="button"
            size="sm"
            className="mt-3 w-full"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onApply(fill, stroke);
              setOpen(false);
            }}
          >
            Aplicar
          </Button>
        </div>
      )}
    </span>
  );
}

function BulletMenu({ onPick }: { onPick: (char: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <TB title="Marcador da lista" onClick={() => setOpen((o) => !o)}>
        ◉—
      </TB>
      {open && (
        <div className="absolute left-0 top-9 z-50 grid max-h-[15rem] w-[17rem] grid-cols-10 gap-1 overflow-y-auto rounded-lg border border-border bg-popover p-2 shadow-xl">
          {BULLETS.map((b, i) => (
            <button
              key={`${b}-${i}`}
              type="button"
              title={`Marcador ${b}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(b);
                setOpen(false);
              }}
              className="rounded p-1 text-sm hover:bg-secondary"
            >
              {b}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}



/* ── Editor ──────────────────────────────────────────────────────────── */

export function RichTextEditor({
  value,
  onChange,
  minHeight = 380,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);
  const [state, setState] = useState<SelectionState>(EMPTY_STATE);
  const [source, setSource] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) el.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const emit = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const focusEditor = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    if (savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }, []);

  const refreshState = useCallback(() => {
    if (typeof document === "undefined") return;
    const q = (c: string) => {
      try {
        return document.queryCommandState(c);
      } catch {
        return false;
      }
    };
    setState({
      bold: q("bold"),
      italic: q("italic"),
      underline: q("underline"),
      strike: q("strikeThrough"),
      ul: q("insertUnorderedList"),
      ol: q("insertOrderedList"),
      left: q("justifyLeft"),
      center: q("justifyCenter"),
      right: q("justifyRight"),
      justify: q("justifyFull"),
    });
  }, []);

  const exec = useCallback(
    (command: string, argument?: string) => {
      focusEditor();
      try {
        document.execCommand("styleWithCSS", false, "true");
      } catch {
        /* noop */
      }
      document.execCommand(command, false, argument);
      emit();
      refreshState();
      saveRange();
    },
    [emit, focusEditor, refreshState, saveRange],
  );

  const insertHTML = useCallback(
    (html: string) => {
      focusEditor();
      document.execCommand("insertHTML", false, html);
      emit();
      saveRange();
    },
    [emit, focusEditor, saveRange],
  );

  const selectedHTML = useCallback(() => {
    const sel = savedRange.current;
    if (!sel || sel.collapsed) return "";
    const div = document.createElement("div");
    div.appendChild(sel.cloneContents());
    return div.innerHTML;
  }, []);

  /** Wrap the current selection (or a placeholder) in custom markup. */
  const wrapSelection = useCallback(
    (open: string, close: string, placeholder: string) => {
      const inner = selectedHTML() || placeholder;
      insertHTML(`${open}${inner}${close}`);
    },
    [insertHTML, selectedHTML],
  );

  const applyBlockStyle = useCallback(
    (prop: string, val: string) => {
      focusEditor();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node !== ref.current) {
        if (node.nodeType === 1) {
          const el = node as HTMLElement;
          const display = window.getComputedStyle(el).display;
          if (display !== "inline") {
            el.style.setProperty(prop, val);
            emit();
            return;
          }
        }
        node = node.parentNode;
      }
      if (ref.current) {
        ref.current.style.setProperty(prop, val);
        emit();
      }
    },
    [emit, focusEditor],
  );

  const promptInsert = {
    link: () => {
      const url = window.prompt("Endereço do link (https://...)");
      if (!url) return;
      const label = selectedHTML();
      if (label) exec("createLink", url);
      else
        insertHTML(
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>&nbsp;`,
        );
    },
    image: () => {
      const url = window.prompt("URL da imagem (https://...)");
      if (!url) return;
      const alt = window.prompt("Texto alternativo (descrição da imagem)") ?? "";
      insertHTML(`<figure class="rc-figure"><img src="${url}" alt="${alt}" loading="lazy" /></figure><p><br></p>`);
    },
    video: () => {
      const url = window.prompt("URL do vídeo (YouTube ou MP4)");
      if (!url) return;
      const src = youtubeEmbed(url);
      const html = /\.mp4($|\?)/i.test(url)
        ? `<figure class="rc-video"><video src="${url}" controls playsinline></video></figure>`
        : `<figure class="rc-video"><iframe src="${src}" title="Vídeo" allowfullscreen loading="lazy" frameborder="0"></iframe></figure>`;
      insertHTML(`${html}<p><br></p>`);
    },
    table: () => {
      const cols = Number(window.prompt("Quantas colunas?", "2") ?? 2);
      const rowsN = Number(window.prompt("Quantas linhas (sem contar o cabeçalho)?", "2") ?? 2);
      if (!cols || !rowsN) return;
      const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Coluna ${i + 1}</th>`).join("")}</tr>`;
      const body = Array.from(
        { length: rowsN },
        () => `<tr>${Array.from({ length: cols }, () => "<td>&nbsp;</td>").join("")}</tr>`,
      ).join("");
      insertHTML(
        `<div class="rc-table-wrap"><table class="rc-table"><thead>${head}</thead><tbody>${body}</tbody></table></div><p><br></p>`,
      );
    },
    comment: () => {
      const author = window.prompt("Autor do comentário", "Equipe") ?? "Equipe";
      wrapSelection(
        `<aside class="rc-comment"><span class="rc-comment-author">💬 ${author}</span><div>`,
        `</div></aside><p><br></p>`,
        "Escreva o comentário aqui.",
      );
    },
    spoiler: () => {
      const label = window.prompt("Título do spoiler", "Clique para revelar") ?? "Spoiler";
      wrapSelection(
        `<details class="rc-spoiler"><summary>${label}</summary><div class="rc-spoiler-body">`,
        `</div></details><p><br></p>`,
        "Conteúdo oculto.",
      );
    },
  };

  const frame = (color: string) =>
    wrapSelection(
      `<div class="rc-frame" style="border-color:${color};box-shadow:inset 0 0 0 1px ${color}33"><div>`,
      `</div></div><p><br></p>`,
      "Conteúdo em moldura.",
    );

  const calloutFrame = (color: string) => {
    const title = window.prompt("Título do aviso", "AVISO CRÍTICO") ?? "AVISO";
    wrapSelection(
      `<div class="rc-callout" style="border-color:${color};background:${color}1f"><p class="rc-callout-title" style="color:${color}">⚠️ ${title}</p><div>`,
      `</div></div><p><br></p>`,
      "Texto do aviso.",
    );
  };

  const glow = (color: string) =>
    wrapSelection(
      `<span class="rc-glow" style="color:${color};text-shadow:0 0 10px ${color},0 0 26px ${color}88">`,
      `</span>`,
      "texto com brilho",
    );

  const badge = (color: string) =>
    wrapSelection(
      `<span class="rc-badge" style="border-color:${color};background:${color}26;color:${color}">`,
      `</span>`,
      "texto com moldura",
    );

  const checklist = () =>
    insertHTML(
      `<ul class="rc-checklist"><li>Primeiro item</li><li>Segundo item</li><li>Terceiro item</li></ul><p><br></p>`,
    );

  const stat = () => {
    const title = window.prompt("Título do destaque", "Tempo Máximo") ?? "Destaque";
    const val = window.prompt("Valor em destaque", "60 SEGUNDOS") ?? "";
    const sub = window.prompt("Legenda (opcional)", "") ?? "";
    insertHTML(
      `<div class="rc-stat"><p class="rc-stat-title">${title}</p><p class="rc-stat-value">${val}</p>${
        sub ? `<p class="rc-stat-sub">${sub}</p>` : ""
      }</div><p><br></p>`,
    );
  };

  const ruleItem = () => {
    const code = window.prompt("Código da regra (ex.: 2.1)", "") ?? "";
    wrapSelection(
      `<p class="rc-rule"><span class="rc-rule-code">${code}</span> – `,
      `</p>`,
      "Descreva a regra aqui.",
    );
  };

  const fontSize = (size: string) => {
    if (!size) return;
    wrapSelection(`<span style="font-size:${size}">`, `</span>`, "texto");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background/60">
      <div
        className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/40 p-2"
        onMouseDown={() => saveRange()}
      >
        <TB title="Desfazer" onClick={() => exec("undo")}>↶</TB>
        <TB title="Refazer" onClick={() => exec("redo")}>↷</TB>
        <Divider />
        <TB title="Negrito" active={state.bold} onClick={() => exec("bold")}>
          <strong>B</strong>
        </TB>
        <TB title="Itálico" active={state.italic} onClick={() => exec("italic")}>
          <em>I</em>
        </TB>
        <TB title="Sublinhado" active={state.underline} onClick={() => exec("underline")}>
          <span className="underline">U</span>
        </TB>
        <TB title="Traçado" active={state.strike} onClick={() => exec("strikeThrough")}>
          <span className="line-through">S</span>
        </TB>
        <TB title="Limpar formatação" onClick={() => exec("removeFormat")}>Tx</TB>
        <Divider />
        <TBSelect
          title="Fonte"
          value=""
          width="8.5rem"
          options={[{ label: "Fonte", value: "" }, ...FONTS.slice(1)]}
          onChange={(v) => v && exec("fontName", v)}
        />
        <TBSelect
          title="Tamanho da letra"
          value=""
          width="6rem"
          options={[{ label: "Tamanho", value: "" }, ...SIZES.map((s) => ({ label: s, value: s }))]}
          onChange={fontSize}
        />
        <TBSelect
          title="Formatação do bloco"
          value=""
          width="7.5rem"
          options={[{ label: "Formatação", value: "" }, ...BLOCKS]}
          onChange={(v) => v && exec("formatBlock", `<${v}>`)}
        />
        <Divider />
        <ColorMenu title="Cor da letra" label="A●" onPick={(c) => exec("foreColor", c)} />
        <ColorMenu title="Cor de fundo do texto" label="▨" onPick={(c) => exec("hiliteColor", c)} />
        <Divider />
        <TB title="Alinhar à esquerda" active={state.left} onClick={() => exec("justifyLeft")}>⇤</TB>
        <TB title="Centralizar" active={state.center} onClick={() => exec("justifyCenter")}>≡</TB>
        <TB title="Alinhar à direita" active={state.right} onClick={() => exec("justifyRight")}>⇥</TB>
        <TB title="Justificar" active={state.justify} onClick={() => exec("justifyFull")}>☰</TB>
        <Divider />
        <TB title="Lista com marcadores" active={state.ul} onClick={() => exec("insertUnorderedList")}>•—</TB>
        <TB title="Lista numerada" active={state.ol} onClick={() => exec("insertOrderedList")}>1—</TB>
        <TB title="Lista de verificação" onClick={checklist}>☑—</TB>
        <TB title="Diminuir recuo" onClick={() => exec("outdent")}>⇠</TB>
        <TB title="Aumentar recuo" onClick={() => exec("indent")}>⇢</TB>
        <TB title="Citação" onClick={() => exec("formatBlock", "<blockquote>")}>❝</TB>
        <Divider />
        <TBSelect
          title="Espaçamento entre linhas"
          value=""
          width="7rem"
          options={[
            { label: "Linhas", value: "" },
            ...LINE_HEIGHTS.map((v) => ({ label: v, value: v })),
          ]}
          onChange={(v) => v && applyBlockStyle("line-height", v)}
        />
        <TBSelect
          title="Espaçamento entre parágrafos"
          value=""
          width="8rem"
          options={[
            { label: "Parágrafos", value: "" },
            ...PARAGRAPH_SPACING.map((v) => ({ label: v, value: v })),
          ]}
          onChange={(v) => v && applyBlockStyle("margin-bottom", v)}
        />
        <Divider />
        <TB title="Inserir link" onClick={promptInsert.link}>🔗</TB>
        <TB title="Remover link" onClick={() => exec("unlink")}>🔗✕</TB>
        <TB title="Inserir imagem" onClick={promptInsert.image}>🖼️</TB>
        <TB title="Inserir vídeo" onClick={promptInsert.video}>🎬</TB>
        <TB title="Inserir tabela" onClick={promptInsert.table}>▦</TB>
        <Divider />
        <ColorMenu title="Moldura (escolha a cor)" label="▭" onPick={frame} />
        <ColorMenu title="Caixa de aviso com moldura" label="⚠▣" onPick={calloutFrame} />
        <ColorMenu title="Texto com brilho" label="A✨" onPick={glow} />
        <ColorMenu title="Texto com moldura (destaque)" label="A▢" onPick={badge} />
        <Divider />
        <TB title="Item de regra numerado" onClick={ruleItem}>§</TB>
        <TB title="Bloco de destaque (número grande)" onClick={stat}>#</TB>
        <TB title="Spoiler" onClick={promptInsert.spoiler}>👁️</TB>
        <TB title="Comentário" onClick={promptInsert.comment}>💬</TB>
        <TB title="Linha divisória" onClick={() => insertHTML('<hr class="rc-hr" />')}>—</TB>
        <TB
          title="Paginação (quebra de página)"
          onClick={() => insertHTML('<div class="rc-pagebreak"></div><p><br></p>')}
        >
          ⤓
        </TB>
        <Divider />
        <span className="relative">
          <TB title="Emojis" onClick={() => setEmojiOpen((o) => !o)}>😀</TB>
          {emojiOpen && (
            <div className="absolute left-0 top-9 z-50 grid w-[17rem] grid-cols-10 gap-1 rounded-lg border border-border bg-popover p-2 shadow-xl">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    insertHTML(e);
                    setEmojiOpen(false);
                  }}
                  className="rounded p-1 text-base hover:bg-secondary"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </span>
        <TB title="Código-fonte (HTML)" active={source} onClick={() => setSource((s) => !s)}>
          &lt;/&gt;
        </TB>
      </div>

      {source ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full resize-y bg-background p-4 font-mono text-xs leading-relaxed text-foreground outline-none"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Editor de texto"
          style={{ minHeight }}
          onInput={emit}
          onBlur={() => {
            saveRange();
            emit();
          }}
          onKeyUp={() => {
            saveRange();
            refreshState();
          }}
          onMouseUp={() => {
            saveRange();
            refreshState();
          }}
          className="rich-content max-h-[60vh] overflow-y-auto p-4 outline-none"
        />
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border bg-secondary/30 px-3 py-2">
        <p className="text-[11px] text-muted-foreground">
          Selecione o texto antes de aplicar molduras, brilho ou destaques. Use o Código-Fonte para ajustes finos.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm("Limpar todo o conteúdo do editor?")) onChange("");
            if (ref.current) ref.current.innerHTML = "";
          }}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
