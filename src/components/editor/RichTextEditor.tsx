import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  Clipboard,
  Copy,
  Paintbrush,
  Palette,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { Toolbar } from "./Toolbar";
import { InspectorPanel } from "./InspectorPanel";
import { QuickSlashMenu } from "./QuickSlashMenu";
import { SearchReplaceDialog } from "./SearchReplaceDialog";
import { ExportImportDialog } from "./ExportImportDialog";
import { CustomComponentsManager } from "./CustomComponentsManager";
import { ColorPickerBody } from "./ColorPickerPopover";
import { RichContent } from "./RichContent";
import type { EditorViewMode, PreviewDevice, SelectionFormatState } from "./editor-types";
import { toast } from "sonner";

const EMPTY_SELECTION_STATE: SelectionFormatState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  subscript: false,
  superscript: false,
  code: false,
  fontFamily: "",
  fontSize: "",
  color: "#ffffff",
  backgroundColor: "transparent",
  glow: { enabled: false, color: "#8b5cf6", blur: 10, spread: 0, opacity: 1, layers: 1 },
  stroke: { enabled: false, width: 1, color: "#ffffff", style: "solid" },
  shadow: { enabled: false, x: 0, y: 0, blur: 0, color: "rgba(0,0,0,0)", opacity: 1 },
  gradient: { enabled: false, type: "linear", angle: 135, from: "#8b5cf6", to: "#ec4899" },
  alignment: "left",
  bulletList: false,
  numberedList: false,
};

function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return url;
}

/** Encontra o componente/bloco colorível mais EXTERNO a partir de um nó
 *  (cards rc-*, tabelas, figuras, citações e, opcionalmente, listas simples).
 *  Usado para recolorir e para detectar quando o Enter deve "escapar" do bloco.
 *  `includeBareLists` fica ligado só na recoloração — o Enter precisa manter o
 *  comportamento nativo dentro de listas comuns. */
function colorableRootFrom(
  node: Node | null,
  stopAt: HTMLElement | null,
  includeBareLists = false,
): HTMLElement | null {
  let outer: HTMLElement | null = null;
  let cur: Node | null = node;
  while (cur && cur !== stopAt) {
    if (cur.nodeType === 1) {
      const el = cur as HTMLElement;
      const cls = typeof el.className === "string" ? el.className : "";
      const tagMatch = includeBareLists
        ? /^(FIGURE|BLOCKQUOTE|TABLE|UL|OL)$/.test(el.tagName)
        : /^(FIGURE|BLOCKQUOTE|TABLE)$/.test(el.tagName);
      if (/^rc-/i.test(cls.trim()) || tagMatch) {
        outer = el;
      }
    }
    cur = cur.parentNode;
  }
  return outer;
}

/** Cor HEX mais frequente entre os estilos inline do componente (o "accent"). */
function dominantAccentOf(root: HTMLElement): string {
  const styled: HTMLElement[] = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement>("[style]")),
  ];
  const counts = new Map<string, number>();
  for (const el of styled) {
    const st = el.getAttribute("style");
    if (!st) continue;
    for (const m of st.matchAll(/#[0-9a-fA-F]{6}/g)) {
      const h = m[0].toLowerCase();
      counts.set(h, (counts.get(h) ?? 0) + 1);
    }
  }
  let accent = "";
  let max = 0;
  counts.forEach((count, hex) => {
    if (count > max && hex !== "#000000" && hex !== "#ffffff") {
      max = count;
      accent = hex;
    }
  });
  return accent;
}

/** Troca a cor de um componente inserido (borda, fundos, textos) preservando
 *  os sufixos alfa (#ef444414 → #novo14). Suporta cor sólida ou gradiente.
 *  Listas trocam apenas a cor dos marcadores via variáveis CSS. */
function recolorComponent(root: HTMLElement, color: string, isGradient: boolean) {
  const hex = (color.match(/#[0-9a-fA-F]{6}/)?.[0] ?? "").toLowerCase();
  const tag = root.tagName;

  if (tag === "UL" || tag === "OL") {
    const marker = hex || "#8b5cf6";
    root.style.setProperty("--rc-marker", marker);
    root.style.setProperty("--rc-bullet-c", marker);
    return;
  }

  const accent = dominantAccentOf(root);
  if (accent && hex) {
    const re = new RegExp(accent, "gi");
    for (const el of Array.from(root.querySelectorAll<HTMLElement>("[style]")).concat([root])) {
      const st = el.getAttribute("style");
      if (!st || !st.toLowerCase().includes(accent)) continue;
      el.setAttribute("style", st.replace(re, hex));
    }
  }

  if (isGradient) {
    root.style.background = color;
    const bc = color.toLowerCase().match(/#[0-9a-f]{6}|rgba?\([^)]*\)/i)?.[0];
    if (bc) root.style.borderColor = bc;
  } else if (hex) {
    root.style.borderColor = hex;
    // Componentes sem accent HEX (ex.: accordion com var(--primary)) ganham a
    // cor via variável CSS dos marcadores/títulos.
    if (!accent) root.style.setProperty("--rc-marker", hex);
  }
}

export function RichTextEditor({
  value,
  onChange,
  minHeight = 420,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);

  // States
  const [viewMode, setViewMode] = useState<EditorViewMode>("visual");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectionState, setSelectionState] = useState<SelectionFormatState>(EMPTY_SELECTION_STATE);
  const [copiedStyles, setCopiedStyles] = useState<Record<string, string> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");

  // Modals & Popups
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });

  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [customComponentsOpen, setCustomComponentsOpen] = useState(false);

  // Context Menu
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [targetContextNode, setTargetContextNode] = useState<HTMLElement | null>(null);

  // Recolorização de componentes ("Cor do componente")
  const [recolorTarget, setRecolorTarget] = useState<{
    el: HTMLElement;
    x: number;
    y: number;
  } | null>(null);

  // Performance: debounce do emit durante a digitação + última posição do ponteiro
  const emitTimer = useRef<number | null>(null);
  const pointerPos = useRef<{ x: number; y: number }>({
    x: Math.max(24, (typeof window !== "undefined" ? window.innerWidth : 800) / 2 - 160),
    y: 140,
  });

  // Parágrafo separador padrão (Enter cria <p>, evita <div> solto dentro de cards)
  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      /* noop */
    }
  }, []);

  // Sync internal editor content with incoming value
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value, viewMode]);

  // Emit changes to parent
  const emit = useCallback(() => {
    if (emitTimer.current) {
      window.clearTimeout(emitTimer.current);
      emitTimer.current = null;
    }
    if (editorRef.current) {
      setSaveStatus("saving");
      const currentHtml = editorRef.current.innerHTML;
      onChange(currentHtml);
      setTimeout(() => {
        setSaveStatus("saved");
        const now = new Date();
        setLastSavedTime(
          `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
        );
      }, 300);
    }
  }, [onChange]);

  // Digitação dispara o emit com debounce curto para não travar em documentos grandes.
  const scheduleEmit = useCallback(() => {
    if (emitTimer.current) window.clearTimeout(emitTimer.current);
    emitTimer.current = window.setTimeout(() => {
      emitTimer.current = null;
      emit();
    }, 250);
  }, [emit]);

  useEffect(
    () => () => {
      if (emitTimer.current) window.clearTimeout(emitTimer.current);
    },
    [],
  );

  // Selection range helpers
  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current?.contains(sel.anchorNode) &&
      sel.getRangeAt(0).startContainer.isConnected
    ) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Acompanha a seleção continuamente (inclusive durante o arraste do mouse),
  // garantindo que botões da barra sempre apliquem na seleção correta.
  useEffect(() => {
    const onSelectionChange = () => saveRange();
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [saveRange]);

  // Range ativa preferindo a seleção viva da janela (fallback: última salva).
  const getActiveRange = useCallback((): Range | null => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && el?.contains(sel.anchorNode)) {
      return sel.getRangeAt(0);
    }
    if (savedRange.current && savedRange.current.startContainer.isConnected) {
      return savedRange.current;
    }
    return null;
  }, []);

  const restoreRange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const sel = window.getSelection();
    if (!sel) return;
    if (savedRange.current && savedRange.current.startContainer.isConnected) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    } else {
      savedRange.current = null;
    }
  }, []);

  const refreshSelectionState = useCallback(() => {
    if (typeof document === "undefined") return;
    const q = (c: string) => {
      try {
        return document.queryCommandState(c);
      } catch {
        return false;
      }
    };
    setSelectionState((prev) => ({
      ...prev,
      bold: q("bold"),
      italic: q("italic"),
      underline: q("underline"),
      strike: q("strikeThrough"),
      bulletList: q("insertUnorderedList"),
      numberedList: q("insertOrderedList"),
    }));
  }, []);

  const exec = useCallback(
    (command: string, argument?: string) => {
      restoreRange();
      try {
        document.execCommand("styleWithCSS", false, "true");
      } catch {
        /* noop */
      }
      document.execCommand(command, false, argument);
      emit();
      refreshSelectionState();
      saveRange();
    },
    [emit, restoreRange, refreshSelectionState, saveRange],
  );

  const insertHTML = useCallback(
    (html: string) => {
      restoreRange();
      document.execCommand("insertHTML", false, html);
      emit();
      saveRange();
    },
    [emit, restoreRange, saveRange],
  );

  const selectedHTML = useCallback(() => {
    const sel = getActiveRange();
    if (!sel || sel.collapsed) return "";
    const div = document.createElement("div");
    div.appendChild(sel.cloneContents());
    return div.innerHTML;
  }, [getActiveRange]);

  const wrapSelection = useCallback(
    (openTag: string, closeTag: string, placeholder: string) => {
      const inner = selectedHTML() || placeholder;
      insertHTML(`${openTag}${inner}${closeTag}`);
    },
    [insertHTML, selectedHTML],
  );

  const applyStyleToTarget = useCallback(
    (property: string, value: string) => {
      restoreRange();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      if (!sel.isCollapsed) {
        // Apply inline style on selection
        const inner = selectedHTML() || "texto";
        insertHTML(`<span style="${property}:${value}">${inner}</span>`);
        return;
      }

      // Apply on nearest block container
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === 1) {
          const el = node as HTMLElement;
          el.style.setProperty(property, value);
          emit();
          return;
        }
        node = node.parentNode;
      }
      if (editorRef.current) {
        editorRef.current.style.setProperty(property, value);
        emit();
      }
    },
    [emit, insertHTML, restoreRange, selectedHTML],
  );

  const applyBatchStyles = useCallback(
    (styles: Record<string, string>) => {
      restoreRange();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const styleString = Object.entries(styles)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");

      if (!sel.isCollapsed) {
        const inner = selectedHTML() || "texto formatado";
        insertHTML(`<span style="${styleString}">${inner}</span>`);
        return;
      }

      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === 1) {
          const el = node as HTMLElement;
          Object.entries(styles).forEach(([k, v]) => el.style.setProperty(k, v));
          emit();
          return;
        }
        node = node.parentNode;
      }
    },
    [emit, insertHTML, restoreRange, selectedHTML],
  );

  // Gradiente aplicado como texto (recorte do fundo nas letras).
  const applyGradientText = useCallback(
    (gradient: string) => {
      applyBatchStyles({
        background: gradient,
        "background-clip": "text",
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent",
        color: "transparent",
      });
    },
    [applyBatchStyles],
  );

  // Format Painter (Copy Style & Paste Style)
  const handleCopyStyle = useCallback(() => {
    saveRange();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      toast.error("Selecione um elemento ou texto para copiar o estilo.");
      return;
    }
    let node: Node | null = sel.getRangeAt(0).startContainer;
    if (node && node.nodeType === 3) node = node.parentNode;
    if (node && node.nodeType === 1) {
      const el = node as HTMLElement;
      const computed = window.getComputedStyle(el);
      const stylesObj = {
        color: computed.color,
        background: computed.background,
        "font-family": computed.fontFamily,
        "font-size": computed.fontSize,
        "font-weight": computed.fontWeight,
        "letter-spacing": computed.letterSpacing,
        "line-height": computed.lineHeight,
        "text-shadow": computed.textShadow,
        "border-color": computed.borderColor,
        "border-width": computed.borderWidth,
        "border-style": computed.borderStyle,
        "border-radius": computed.borderRadius,
      };
      setCopiedStyles(stylesObj);
      toast.success(
        "Estilo copiado com sucesso! Selecione outro texto e clique no pincel para aplicar.",
      );
    }
  }, [saveRange]);

  const handlePasteStyle = useCallback(() => {
    if (!copiedStyles) {
      toast.error("Nenhum estilo copiado ainda.");
      return;
    }
    applyBatchStyles(copiedStyles);
    toast.success("Estilo aplicado com sucesso!");
    setCopiedStyles(null);
  }, [copiedStyles, applyBatchStyles]);

  // Garante um parágrafo editável após o último elemento. Sem isso, o cursor
  // fica "preso" dentro do último card/tabela/citação do documento.
  const ensureTrailingParagraph = useCallback((): boolean => {
    const el = editorRef.current;
    if (!el) return false;
    const last = el.lastElementChild;
    if (last && !/^(P|UL|OL)$/i.test(last.tagName)) {
      el.insertAdjacentHTML("beforeend", "<p><br></p>");
      return true;
    }
    return false;
  }, []);

  // Abre o painel "Cor do componente" para o bloco sob o cursor/seleção.
  const openRecolorFromSelection = useCallback(() => {
    saveRange();
    const range = getActiveRange();
    const rootEl = colorableRootFrom(range?.startContainer ?? null, editorRef.current, true);
    if (!rootEl) {
      toast.error(
        "Posicione o cursor dentro de um componente, tabela, lista ou citação para trocar a cor.",
      );
      return;
    }
    setRecolorTarget({ el: rootEl, x: pointerPos.current.x, y: pointerPos.current.y });
  }, [getActiveRange, saveRange]);

  // Insert Rich RP Components
  const handleInsertComponent = useCallback(
    (type: string) => {
      switch (type) {
        case "rule": {
          const code = window.prompt("Código da regra (ex.: 1.1)", "1.1") ?? "1.1";
          const title =
            window.prompt("Título da regra (ex.: METAGAMING)", "NOME DA REGRA") ?? "REGRA";
          const status =
            window.prompt("Status da regra (PROIBIDO, PERMITIDO, OBRIGATÓRIO)", "PROIBIDO") ??
            "PROIBIDO";
          const penalty = window.prompt("Penalidade prevista", "Banimento de 7 a 30 dias.") ?? "";

          const isProibido = status.toUpperCase().includes("PROIB");
          const color = isProibido ? "#ef4444" : "#22c55e";

          insertHTML(`
            <div class="rc-rule-card" style="border:1px solid ${color}60;background:${color}10;border-radius:0.85rem;padding:1.2rem;margin:1.2rem 0;box-shadow:0 0 15px ${color}15;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.5rem;">
                <span class="rc-rule-code" style="color:${color};font-weight:800;font-size:1.1rem;font-family:var(--font-display);letter-spacing:0.04em;">
                  ⚖️ ${code} — ${title.toUpperCase()}
                </span>
                <span class="rc-badge" style="border:1px solid ${color};background:${color}25;color:${color};font-size:0.75rem;padding:0.15rem 0.6rem;border-radius:0.35rem;font-weight:700;">
                  ${status.toUpperCase()}
                </span>
              </div>
              <p style="margin:0 0 0.6rem;color:var(--foreground);font-size:0.95rem;line-height:1.65;">
                Descreva detalhadamente a regra, conduta esperada e exemplos práticos para os jogadores.
              </p>
              ${
                penalty
                  ? `<div style="border-top:1px solid ${color}35;padding-top:0.6rem;font-size:0.85rem;color:${color};">
                      <strong>⚖️ Penalidade:</strong> ${penalty}
                    </div>`
                  : ""
              }
            </div>
            <p><br></p>
          `);
          break;
        }

        case "penalty": {
          const title =
            window.prompt("Título da Penalidade", "BANIMENTO PERMANENTE") ?? "PENALIDADE";
          const desc =
            window.prompt(
              "Descrição / Motivos",
              "Aplicável em casos de uso de trapaças, racismo, preconceito ou condutas graves.",
            ) ?? "";
          insertHTML(`
            <div class="rc-penalty-card" style="border-left:4px solid #ef4444;background:#ef444414;border-radius:0 0.85rem 0.85rem 0;padding:1.2rem;margin:1.2rem 0;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
                <span style="font-size:1.3rem;">🛑</span>
                <h4 style="color:#ef4444;font-family:var(--font-display);font-size:1.1rem;margin:0;letter-spacing:0.05em;text-transform:uppercase;">
                  ${title}
                </h4>
              </div>
              <p style="margin:0;color:var(--foreground);font-size:0.92rem;line-height:1.6;">
                ${desc}
              </p>
            </div>
            <p><br></p>
          `);
          break;
        }

        case "compare": {
          insertHTML(`
            <div class="rc-compare-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin:1.5rem 0;">
              <div style="border:1px solid #22c55e;background:#22c55e12;border-radius:0.85rem;padding:1.1rem;box-shadow:0 0 15px rgba(34,197,94,0.1);">
                <h4 style="color:#22c55e;font-weight:800;font-size:0.95rem;margin:0 0 0.6rem;display:flex;align-items:center;gap:0.4rem;font-family:var(--font-display);letter-spacing:0.05em;">
                  <span>✓</span> PERMITIDO
                </h4>
                <ul style="list-style:none;padding-left:0;margin:0;font-size:0.88rem;line-height:1.65;color:var(--foreground);">
                  <li style="margin-bottom:0.4rem;">• Negociação pacífica e exigência de garantias</li>
                  <li style="margin-bottom:0.4rem;">• Gravação em primeira pessoa de todas as ações</li>
                  <li>• Uso de veículos táticos conforme as regras de porte</li>
                </ul>
              </div>
              <div style="border:1px solid #ef4444;background:#ef444412;border-radius:0.85rem;padding:1.1rem;box-shadow:0 0 15px rgba(239,68,68,0.1);">
                <h4 style="color:#ef4444;font-weight:800;font-size:0.95rem;margin:0 0 0.6rem;display:flex;align-items:center;gap:0.4rem;font-family:var(--font-display);letter-spacing:0.05em;">
                  <span>✕</span> PROIBIDO
                </h4>
                <ul style="list-style:none;padding-left:0;margin:0;font-size:0.88rem;line-height:1.65;color:var(--foreground);">
                  <li style="margin-bottom:0.4rem;">• Disparo sem aviso sonoro ou motivo (RDM)</li>
                  <li style="margin-bottom:0.4rem;">• Atropelamento proposital de civis (VDM)</li>
                  <li>• Desconectar ou forçar crash no meio de abordagem</li>
                </ul>
              </div>
            </div>
            <p><br></p>
          `);
          break;
        }

        case "card-info":
        case "card-success":
        case "card-warning":
        case "card-danger":
        case "card-critical":
        case "card-tip": {
          const map = {
            "card-info": { color: "#3b82f6", icon: "🔵", title: "INFORMAÇÃO IMPORTANTE" },
            "card-success": { color: "#22c55e", icon: "🟢", title: "DIRETRIZ APROVADA" },
            "card-warning": { color: "#f59e0b", icon: "🟡", title: "AVISO / ATENÇÃO" },
            "card-danger": { color: "#ef4444", icon: "🔴", title: "CONDUTA PROIBIDA" },
            "card-critical": { color: "#dc2626", icon: "🛑", title: "REGRA CRÍTICA" },
            "card-tip": { color: "#eab308", icon: "💡", title: "DICA DE ROLEPLAY" },
          }[type]!;

          insertHTML(`
            <div class="rc-card-box" style="border:1px solid ${map.color};background:${map.color}15;border-radius:0.85rem;padding:1.2rem;margin:1.2rem 0;box-shadow:0 0 15px ${map.color}20;">
              <h4 style="color:${map.color};font-family:var(--font-display);font-size:1.1rem;margin:0 0 0.5rem;display:flex;align-items:center;gap:0.5rem;letter-spacing:0.04em;">
                <span>${map.icon}</span> ${map.title}
              </h4>
              <p style="margin:0;color:var(--foreground);font-size:0.92rem;line-height:1.65;">
                Insira aqui as instruções e orientações referentes a este aviso.
              </p>
            </div>
            <p><br></p>
          `);
          break;
        }

        case "accordion": {
          insertHTML(`
            <div class="rc-accordion" style="border:1px solid var(--border);border-radius:0.85rem;overflow:hidden;margin:1.3rem 0;background:rgba(255,255,255,0.03);">
              <details open style="border-bottom:1px solid var(--border);">
                <summary style="padding:0.9rem 1.2rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;color:var(--primary);font-family:var(--font-display);font-size:1rem;letter-spacing:0.04em;text-transform:uppercase;">
                  <span>▶ 1. Acesso à Cidade e Diretrizes</span>
                </summary>
                <div class="rc-accordion-body" style="padding:1rem 1.2rem;border-top:1px solid var(--border);color:var(--foreground);font-size:0.92rem;line-height:1.65;">
                  Conteúdo detalhado da primeira seção. Você pode incluir listas, regras, imagens e tabelas aqui dentro.
                </div>
              </details>
              <details>
                <summary style="padding:0.9rem 1.2rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;color:var(--primary);font-family:var(--font-display);font-size:1rem;letter-spacing:0.04em;text-transform:uppercase;">
                  <span>▶ 2. Regras de Participação em Ações</span>
                </summary>
                <div class="rc-accordion-body" style="padding:1rem 1.2rem;border-top:1px solid var(--border);color:var(--foreground);font-size:0.92rem;line-height:1.65;">
                  Conteúdo detalhado da segunda seção expansível.
                </div>
              </details>
            </div>
            <p><br></p>
          `);
          break;
        }

        case "stat-battle": {
          insertHTML(`
            <div class="rc-stat-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.5rem 0;">
              <div style="border:1px solid #ef4444;background:#ef444415;border-radius:0.85rem;padding:1.2rem;text-align:center;box-shadow:0 0 15px rgba(239,68,68,0.15);">
                <p style="margin:0 0 0.2rem;color:#ef4444;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">💀 Bandidos / Assaltantes</p>
                <p style="margin:0;color:#ef4444;font-family:var(--font-display);font-size:2.4rem;line-height:1;">10 MÁX</p>
              </div>
              <div style="border:1px solid #3b82f6;background:#3b82f615;border-radius:0.85rem;padding:1.2rem;text-align:center;box-shadow:0 0 15px rgba(59,130,246,0.15);">
                <p style="margin:0 0 0.2rem;color:#3b82f6;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">🚔 Polícia / Forças</p>
                <p style="margin:0;color:#3b82f6;font-family:var(--font-display);font-size:2.4rem;line-height:1;">12 MÁX</p>
              </div>
            </div>
            <p><br></p>
          `);
          break;
        }

        case "stat": {
          const title = window.prompt("Título do Destaque", "Tempo Máximo de Ação") ?? "Destaque";
          const val = window.prompt("Valor em Destaque", "60 MINUTOS") ?? "60";
          const sub =
            window.prompt("Legenda / Subtítulo", "Contagem a partir do primeiro disparo.") ?? "";
          insertHTML(`
            <div class="rc-stat" style="border:1px solid #8b5cf6;background:#8b5cf615;border-radius:0.85rem;margin:1.2rem 0;padding:1.2rem;text-align:center;box-shadow:0 0 20px rgba(139,92,246,0.15);">
              <p class="rc-stat-title" style="color:var(--foreground);font-size:0.82rem;font-weight:700;letter-spacing:0.12em;margin:0 0 0.4rem;text-transform:uppercase;">${title}</p>
              <p class="rc-stat-value" style="color:#8b5cf6;font-family:var(--font-display);font-size:2.2rem;margin:0;line-height:1.1;">${val}</p>
              ${sub ? `<p class="rc-stat-sub" style="font-size:0.85rem;margin:0.4rem 0 0;color:var(--muted-foreground);">${sub}</p>` : ""}
            </div>
            <p><br></p>
          `);
          break;
        }

        case "divider-glow": {
          insertHTML('<div class="rc-divider-glow"></div><p><br></p>');
          break;
        }

        case "divider-icon": {
          const icon = window.prompt("Ícone ou texto central do divisor", "✦") ?? "✦";
          insertHTML(`
            <div class="rc-divider" style="display:flex;align-items:center;text-align:center;margin:2rem 0;color:#8b5cf6;font-weight:bold;font-size:1.1rem;">
              <span style="padding:0 1rem;">${icon}</span>
            </div>
            <p><br></p>
          `);
          break;
        }

        case "quote": {
          const author = window.prompt("Autor da Citação", "Administração Thug Life RJ") ?? "Staff";
          insertHTML(`
            <blockquote style="border-left:4px solid #8b5cf6;background:#8b5cf612;border-radius:0 0.8rem 0.8rem 0;margin:1.2rem 0;padding:1rem 1.3rem;font-style:italic;color:var(--foreground);">
              <p style="margin:0 0 0.4rem;font-size:0.95rem;line-height:1.6;">
                &ldquo;O bom senso e a valorização da vida são as chaves de ouro para um roleplay imersivo e justo.&rdquo;
              </p>
              <footer style="font-size:0.8rem;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.05em;">
                — ${author}
              </footer>
            </blockquote>
            <p><br></p>
          `);
          break;
        }

        case "badge": {
          const text = window.prompt("Texto da Etiqueta / Badge", "IMPORTANTE") ?? "TAG";
          const color =
            window.prompt("Cor (HEX ex: #8b5cf6, #ef4444, #22c55e)", "#8b5cf6") ?? "#8b5cf6";
          wrapSelection(
            `<span class="rc-badge" style="border:1px solid ${color};background:${color}22;color:${color};font-size:0.75rem;padding:0.1rem 0.5rem;border-radius:0.35rem;font-weight:700;margin:0 0.2rem;">`,
            `</span>`,
            text,
          );
          break;
        }

        case "table": {
          const cols = Number(window.prompt("Quantas colunas?", "2") ?? 2);
          const rows = Number(window.prompt("Quantas linhas?", "3") ?? 3);
          if (!cols || !rows) return;
          const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th style="border:1px solid var(--border);padding:0.7rem 1rem;background:#8b5cf620;color:var(--foreground);font-weight:700;text-transform:uppercase;font-size:0.8rem;letter-spacing:0.05em;">Coluna ${i + 1}</th>`).join("")}</tr>`;
          const body = Array.from(
            { length: rows },
            () =>
              `<tr>${Array.from({ length: cols }, () => `<td style="border:1px solid var(--border);padding:0.6rem 1rem;font-size:0.9rem;">Conteúdo</td>`).join("")}</tr>`,
          ).join("");
          insertHTML(
            `<div class="rc-table-wrap" style="overflow-x:auto;margin:1.2rem 0;"><table class="rc-table" style="width:100%;border-collapse:collapse;"><thead>${head}</thead><tbody>${body}</tbody></table></div><p><br></p>`,
          );
          break;
        }

        case "checklist": {
          insertHTML(`
            <ul class="rc-checklist" style="list-style:none;margin-left:0;padding-left:0;">
              <li>Primeira diretriz obrigatória</li>
              <li>Segunda diretriz obrigatória</li>
              <li>Terceira diretriz obrigatória</li>
            </ul>
            <p><br></p>
          `);
          break;
        }

        case "image": {
          const url = window.prompt("URL da imagem (https://...)");
          if (!url) return;
          const alt = window.prompt("Descrição / Texto alternativo da imagem", "") ?? "";
          insertHTML(`
            <figure class="rc-figure" style="margin:1.2rem 0;text-align:center;">
              <img src="${url}" alt="${alt}" loading="lazy" style="max-width:100%;border-radius:0.85rem;border:1px solid var(--border);box-shadow:0 4px 20px rgba(0,0,0,0.5);display:inline-block;" />
              ${alt ? `<figcaption style="margin-top:0.4rem;font-size:0.8rem;color:var(--muted-foreground);font-style:italic;">${alt}</figcaption>` : ""}
            </figure>
            <p><br></p>
          `);
          break;
        }

        case "video": {
          const url = window.prompt("URL do vídeo (YouTube ou MP4)");
          if (!url) return;
          const src = youtubeEmbed(url);
          const html = /\.mp4($|\?)/i.test(url)
            ? `<figure class="rc-video"><video src="${url}" controls playsinline style="border-radius:0.85rem;border:1px solid var(--border);width:100%;aspect-ratio:16/9;"></video></figure>`
            : `<figure class="rc-video"><iframe src="${src}" title="Vídeo" allowfullscreen loading="lazy" frameborder="0" style="border-radius:0.85rem;border:1px solid var(--border);width:100%;aspect-ratio:16/9;"></iframe></figure>`;
          insertHTML(`${html}<p><br></p>`);
          break;
        }

        case "link": {
          const url = window.prompt("Endereço do Link (https://...)");
          if (!url) return;
          const sel = selectedHTML();
          if (sel) {
            exec("createLink", url);
          } else {
            insertHTML(
              `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;">${url}</a>&nbsp;`,
            );
          }
          break;
        }

        case "pagebreak": {
          insertHTML('<div class="rc-pagebreak"></div><p><br></p>');
          break;
        }

        case "code-inline": {
          wrapSelection(
            '<code style="background:rgba(255,255,255,0.1);padding:0.15rem 0.4rem;border-radius:0.3rem;font-family:monospace;font-size:0.85em;color:var(--primary);">',
            "</code>",
            "código",
          );
          break;
        }

        default:
          break;
      }
    },
    [exec, insertHTML, selectedHTML, wrapSelection],
  );

  // Search & Replace Handlers
  const handleSearch = useCallback((query: string, matchCase: boolean): number => {
    if (!editorRef.current || !query) return 0;
    const text = editorRef.current.innerText || "";
    const regex = new RegExp(query, matchCase ? "g" : "gi");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }, []);

  const handleNextSearch = useCallback(() => {
    // Uses window.find if available
    if (typeof window !== "undefined" && "find" in window) {
      // @ts-expect-error find standard web api
      window.find();
    }
  }, []);

  const handlePrevSearch = useCallback(() => {
    if (typeof window !== "undefined" && "find" in window) {
      // @ts-expect-error find standard web api
      window.find(undefined, undefined, true);
    }
  }, []);

  const handleReplace = useCallback(
    (query: string, replaceWith: string, matchCase: boolean): boolean => {
      if (!editorRef.current || !query) return false;
      const html = editorRef.current.innerHTML;
      const regex = new RegExp(query, matchCase ? "" : "i");
      if (regex.test(html)) {
        editorRef.current.innerHTML = html.replace(regex, replaceWith);
        emit();
        return true;
      }
      return false;
    },
    [emit],
  );

  const handleReplaceAll = useCallback(
    (query: string, replaceWith: string, matchCase: boolean): number => {
      if (!editorRef.current || !query) return 0;
      const html = editorRef.current.innerHTML;
      const regex = new RegExp(query, matchCase ? "g" : "gi");
      const matches = html.match(regex);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        editorRef.current.innerHTML = html.replace(regex, replaceWith);
        emit();
      }
      return count;
    },
    [emit],
  );

  // Key Down & Shortcuts handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Shortcut Ctrl+F
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      setSearchOpen(true);
      return;
    }

    // Enter no fim de um componente (card, tabela, citação…) cria um parágrafo
    // FORA do bloco, em vez de aninhar conteúdo dentro dele.
    if (e.key === "Enter" && !e.shiftKey && viewMode === "visual") {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const compRoot = colorableRootFrom(range.startContainer, editorRef.current);
        if (compRoot) {
          const tail = range.cloneRange();
          tail.selectNodeContents(compRoot);
          tail.setStart(range.endContainer, range.endOffset);
          const hasMedia = tail.cloneContents().querySelector("img,iframe,video,table,hr");
          if (!tail.toString().trim() && !hasMedia) {
            e.preventDefault();
            const p = document.createElement("p");
            p.appendChild(document.createElement("br"));
            compRoot.parentNode?.insertBefore(p, compRoot.nextSibling);
            const nr = document.createRange();
            nr.setStart(p, 0);
            nr.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nr);
            savedRange.current = nr.cloneRange();
            emit();
            return;
          }
        }
      }
    }

    // Slash command detection
    if (e.key === "/") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setSlashPos({
          top: rect.bottom + window.scrollY + 6,
          left: rect.left + window.scrollX,
        });
        setSlashFilter("");
        setSlashMenuOpen(true);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    saveRange();
    refreshSelectionState();

    if (slashMenuOpen) {
      if (e.key === "Escape") {
        setSlashMenuOpen(false);
      }
    }
  };

  // Context Menu
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    saveRange();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setTargetContextNode(e.target as HTMLElement);
  };

  const closeContextMenu = () => {
    setContextMenuPos(null);
    setTargetContextNode(null);
  };

  // Outline Jump
  const handleJumpToOutline = (text: string) => {
    if (!editorRef.current) return;
    const elements = Array.from(editorRef.current.querySelectorAll("*"));
    const target = elements.find((el) => el.textContent?.includes(text));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      (target as HTMLElement).style.outline = "2px solid #8b5cf6";
      setTimeout(() => {
        (target as HTMLElement).style.outline = "none";
      }, 1500);
    }
  };

  return (
    <div className="relative flex flex-col rounded-xl border border-border bg-background/80 shadow-xl overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar
        selectionState={selectionState}
        viewMode={viewMode}
        previewDevice={previewDevice}
        inspectorOpen={inspectorOpen}
        hasCopiedStyle={Boolean(copiedStyles)}
        htmlContent={value}
        onSetViewMode={setViewMode}
        onSetPreviewDevice={setPreviewDevice}
        onToggleInspector={() => setInspectorOpen((o) => !o)}
        onExecCommand={exec}
        onApplyFont={(font) => exec("fontName", font)}
        onApplyFontSize={(size) => applyStyleToTarget("font-size", size)}
        onApplyBlock={(block) => exec("formatBlock", `<${block}>`)}
        onApplyColor={(col, isGradient) => {
          if (isGradient) {
            applyGradientText(col);
          } else {
            exec("foreColor", col);
          }
        }}
        onApplyHighlight={(col, isGradient) => {
          if (isGradient) {
            applyStyleToTarget("background-image", col);
          } else {
            applyStyleToTarget("background-color", col);
          }
        }}
        onRecolorElement={openRecolorFromSelection}
        onCopyStyle={handleCopyStyle}
        onPasteStyle={handlePasteStyle}
        onInsertComponent={handleInsertComponent}
        onInsertChar={(char) => insertHTML(char)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenImport={() => setImportOpen(true)}
        onOpenCustomComponents={() => setCustomComponentsOpen(true)}
        onInsertTOC={(toc) => insertHTML(toc)}
        onJumpToOutline={handleJumpToOutline}
        onClearDocument={() => {
          if (window.confirm("Limpar todo o documento?")) {
            onChange("");
            if (editorRef.current) editorRef.current.innerHTML = "";
          }
        }}
      />

      {/* Main Content Area based on View Mode */}
      <div className="relative flex-1">
        {/* VISUAL WYSIWYG MODE */}
        {viewMode === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Editor de Regras e Documentos"
            style={{ minHeight }}
            onInput={scheduleEmit}
            onFocus={() => {
              if (ensureTrailingParagraph()) emit();
              saveRange();
              refreshSelectionState();
            }}
            onPointerDownCapture={(e) => {
              pointerPos.current = { x: e.clientX, y: e.clientY };
            }}
            onBlur={() => {
              if (emitTimer.current) {
                window.clearTimeout(emitTimer.current);
                emitTimer.current = null;
              }
              saveRange();
              emit();
            }}
            onKeyUp={handleKeyUp}
            onKeyDown={handleKeyDown}
            onMouseUp={() => {
              saveRange();
              refreshSelectionState();
            }}
            onClick={(e) => {
              // Clique direto na área vazia do editor (abaixo do conteúdo):
              // move o cursor para o último parágrafo em vez de ficar preso no card.
              if (ensureTrailingParagraph()) {
                emit();
                const lastP = editorRef.current?.lastElementChild;
                if (lastP) {
                  const sel = window.getSelection();
                  const nr = document.createRange();
                  nr.selectNodeContents(lastP);
                  nr.collapse(false);
                  sel?.removeAllRanges();
                  sel?.addRange(nr);
                  savedRange.current = nr.cloneRange();
                }
                return;
              }
              if (e.target === editorRef.current) saveRange();
            }}
            onContextMenu={handleContextMenu}
            className="rich-content p-6 outline-none max-h-[70vh] overflow-y-auto leading-relaxed focus:ring-1 focus:ring-primary/40 rounded-b-xl"
          />
        )}

        {/* PREVIEW REAL MODE */}
        {viewMode === "preview" && (
          <div className="flex justify-center bg-card/40 p-6 max-h-[70vh] overflow-y-auto">
            <div
              style={{
                width:
                  previewDevice === "mobile"
                    ? "375px"
                    : previewDevice === "tablet"
                      ? "768px"
                      : "100%",
                maxWidth: "100%",
              }}
              className="rounded-xl border border-border bg-background p-6 shadow-2xl transition-all"
            >
              <div className="mb-4 flex items-center justify-between border-b border-border pb-2 text-xs text-muted-foreground">
                <span className="font-bold uppercase tracking-wider text-primary">
                  Pré-visualização: {previewDevice.toUpperCase()}
                </span>
                <span>Fidelidade 100% ao site</span>
              </div>
              <RichContent html={value} />
            </div>
          </div>
        )}

        {/* HTML SOURCE MODE */}
        {viewMode === "html" && (
          <div className="p-4 bg-background">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              style={{ minHeight }}
              placeholder="Cole ou edite seu código HTML aqui..."
              className="w-full resize-y bg-background font-mono text-xs leading-relaxed text-foreground outline-none border border-border rounded-lg p-4 focus:border-primary"
            />
          </div>
        )}

        {/* JSON AST / STRUCTURE MODE */}
        {viewMode === "json" && (
          <div className="p-4 bg-background">
            <textarea
              readOnly
              value={JSON.stringify(
                {
                  version: "2.0",
                  generator: "thuglife-visual-rules-editor",
                  timestamp: Date.now(),
                  length: value.length,
                  html: value,
                },
                null,
                2,
              )}
              style={{ minHeight }}
              className="w-full resize-y bg-background font-mono text-xs leading-relaxed text-primary outline-none border border-border rounded-lg p-4"
            />
          </div>
        )}
      </div>

      {/* Quick Slash Menu */}
      <QuickSlashMenu
        isOpen={slashMenuOpen}
        filterText={slashFilter}
        position={slashPos}
        onSelect={(cmd) => {
          setSlashMenuOpen(false);
          handleInsertComponent(cmd);
        }}
        onClose={() => setSlashMenuOpen(false)}
      />

      {/* Right-click Context Menu */}
      {contextMenuPos && (
        <div
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-50 w-56 rounded-xl border border-border bg-popover/95 p-1 text-xs shadow-2xl backdrop-blur animate-in fade-in"
          onClick={closeContextMenu}
        >
          <div className="border-b border-border/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Ações do Elemento
          </div>
          <button
            type="button"
            onClick={() => {
              const range = getActiveRange();
              const el = colorableRootFrom(
                targetContextNode === editorRef.current
                  ? (range?.startContainer ?? null)
                  : targetContextNode,
                editorRef.current,
                true,
              );
              if (!el) {
                toast.error("Nenhum componente colorível neste ponto.");
                return;
              }
              setContextMenuPos(null);
              setRecolorTarget({ el, x: contextMenuPos.x, y: contextMenuPos.y });
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <Palette className="h-3.5 w-3.5 text-primary" /> Cor do componente…
          </button>
          <button
            type="button"
            onClick={() => setInspectorOpen(true)}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" /> Personalizar no Painel
          </button>
          <button
            type="button"
            onClick={handleCopyStyle}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <Paintbrush className="h-3.5 w-3.5 text-muted-foreground" /> Copiar Estilo
          </button>
          <button
            type="button"
            onClick={handlePasteStyle}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <Clipboard className="h-3.5 w-3.5 text-muted-foreground" /> Colar Estilo
          </button>
          <div className="my-1 border-t border-border/50" />
          <button
            type="button"
            onClick={() => {
              if (targetContextNode && targetContextNode !== editorRef.current) {
                const clone = targetContextNode.cloneNode(true);
                targetContextNode.parentNode?.insertBefore(clone, targetContextNode.nextSibling);
                emit();
                toast.success("Elemento duplicado com sucesso!");
              }
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicar Bloco
          </button>
          <button
            type="button"
            onClick={() => {
              if (targetContextNode && targetContextNode !== editorRef.current) {
                const prev = targetContextNode.previousElementSibling;
                if (prev) {
                  targetContextNode.parentNode?.insertBefore(targetContextNode, prev);
                  emit();
                }
              }
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" /> Mover para Cima
          </button>
          <button
            type="button"
            onClick={() => {
              if (targetContextNode && targetContextNode !== editorRef.current) {
                const next = targetContextNode.nextElementSibling;
                if (next) {
                  targetContextNode.parentNode?.insertBefore(next, targetContextNode);
                  emit();
                }
              }
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium hover:bg-secondary"
          >
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" /> Mover para Baixo
          </button>
          <div className="my-1 border-t border-border/50" />
          <button
            type="button"
            onClick={() => {
              if (targetContextNode && targetContextNode !== editorRef.current) {
                targetContextNode.remove();
                emit();
                toast.success("Elemento excluído.");
              }
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-medium text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir Bloco
          </button>
        </div>
      )}

      {/* Painel flutuante "Cor do componente" */}
      {recolorTarget &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[75]" onPointerDown={() => setRecolorTarget(null)} />
            <div
              className="fixed z-[76] w-[19.5rem] rounded-xl border border-border bg-popover p-3 shadow-2xl"
              style={{
                top: Math.min(recolorTarget.y + 8, window.innerHeight - 420),
                left: Math.min(recolorTarget.x, window.innerWidth - 340),
              }}
            >
              <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Palette className="h-3.5 w-3.5 text-primary" /> Cor do Componente
                </span>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setRecolorTarget(null)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mb-2 text-[11px] leading-snug text-muted-foreground">
                Troca todas as cores do componente de uma vez (bordas, fundos e textos). Escolha
                sólida ou gradiente.
              </p>
              <ColorPickerBody
                showGradientTab
                initialColor="#8b5cf6"
                onPick={(color, isGradient) => {
                  // Aplica ao vivo e mantém o painel aberto para ajustar
                  // opacidade/ângulo; feche pelo X ou clicando fora.
                  recolorComponent(recolorTarget.el, color, Boolean(isGradient));
                  emit();
                }}
              />
            </div>
          </>,
          document.body,
        )}

      {/* Property Inspector Panel */}
      <InspectorPanel
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        onApplyStyle={applyStyleToTarget}
        onApplyBatchStyles={applyBatchStyles}
        onWrapWithCustomTag={(tag, styles, cls) => {
          const styleStr = Object.entries(styles)
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          wrapSelection(
            `<${tag} class="${cls || ""}" style="${styleStr}">`,
            `</${tag}>`,
            "conteúdo",
          );
        }}
        onApplyThemePreset={(preset) => {
          toast.success(`Preset "${preset}" aplicado ao editor!`);
        }}
      />

      {/* Dialogs */}
      <SearchReplaceDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        onNext={handleNextSearch}
        onPrev={handlePrevSearch}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
      />

      <ExportImportDialog
        isOpen={exportOpen}
        mode="export"
        htmlContent={value}
        onClose={() => setExportOpen(false)}
        onImportContent={onChange}
      />

      <ExportImportDialog
        isOpen={importOpen}
        mode="import"
        htmlContent={value}
        onClose={() => setImportOpen(false)}
        onImportContent={onChange}
      />

      <CustomComponentsManager
        isOpen={customComponentsOpen}
        onClose={() => setCustomComponentsOpen(false)}
        onInsert={(html) => insertHTML(html)}
        selectedHtml={selectedHTML()}
      />

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              saveStatus === "saving" ? "bg-amber-400 animate-ping" : "bg-emerald-400"
            }`}
          />
          <span>
            {saveStatus === "saving"
              ? "Salvando alterações..."
              : lastSavedTime
                ? `Salvo às ${lastSavedTime}`
                : "Pronto para edição"}
          </span>
          <span className="hidden sm:inline">
            · Digite &ldquo;/&rdquo; no editor para comandos rápidos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{value.length} caracteres</span>
        </div>
      </div>
    </div>
  );
}
