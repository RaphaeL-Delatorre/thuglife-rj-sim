import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { EmojiSpecialPicker } from "./EmojiSpecialPicker";
import { DocumentOutline } from "./DocumentOutline";
import { BLOCKS, FONTS, FONT_SIZES } from "./editor-constants";
import type { EditorViewMode, PreviewDevice, SelectionFormatState } from "./editor-types";

interface ToolbarProps {
  selectionState: SelectionFormatState;
  viewMode: EditorViewMode;
  previewDevice: PreviewDevice;
  inspectorOpen: boolean;
  hasCopiedStyle: boolean;
  htmlContent: string;
  onSetViewMode: (mode: EditorViewMode) => void;
  onSetPreviewDevice: (device: PreviewDevice) => void;
  onToggleInspector: () => void;
  onExecCommand: (command: string, value?: string) => void;
  onApplyFont: (font: string) => void;
  onApplyFontSize: (size: string) => void;
  onApplyBlock: (block: string) => void;
  onApplyColor: (color: string) => void;
  onApplyHighlight: (color: string) => void;
  onCopyStyle: () => void;
  onPasteStyle: () => void;
  onInsertComponent: (type: string) => void;
  onInsertChar: (char: string) => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenCustomComponents: () => void;
  onInsertTOC: (tocHtml: string) => void;
  onJumpToOutline: (text: string) => void;
  onClearDocument: () => void;
}

export function Toolbar({
  selectionState,
  viewMode,
  previewDevice,
  inspectorOpen,
  hasCopiedStyle,
  htmlContent,
  onSetViewMode,
  onSetPreviewDevice,
  onToggleInspector,
  onExecCommand,
  onApplyFont,
  onApplyFontSize,
  onApplyBlock,
  onApplyColor,
  onApplyHighlight,
  onCopyStyle,
  onPasteStyle,
  onInsertComponent,
  onInsertChar,
  onOpenSearch,
  onOpenExport,
  onOpenImport,
  onOpenCustomComponents,
  onInsertTOC,
  onJumpToOutline,
  onClearDocument,
}: ToolbarProps) {
  const TB = ({
    onClick,
    title,
    active,
    disabled,
    children,
  }: {
    onClick: () => void;
    title: string;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/80 hover:bg-secondary hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-1 h-5 w-px bg-border/80 shrink-0" />;

  return (
    <div className="flex flex-col border-b border-border bg-secondary/40 backdrop-blur-sm">
      {/* Upper bar: View mode tabs, preview viewport, tools and inspector trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5 bg-background/40">
        <div className="flex items-center gap-1">
          {/* Editor view modes */}
          <div className="flex rounded-lg bg-secondary/60 p-0.5 text-xs font-semibold">
            {(
              [
                { id: "visual", label: "Visual (WYSIWYG)", icon: "✏️" },
                { id: "preview", label: "Preview Real", icon: "👁️" },
                { id: "html", label: "Código HTML", icon: "</>" },
                { id: "json", label: "JSON Estrutura", icon: "🧩" },
              ] as const
            ).map((vm) => (
              <button
                key={vm.id}
                type="button"
                onClick={() => onSetViewMode(vm.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
                  viewMode === vm.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{vm.icon}</span>
                <span>{vm.label}</span>
              </button>
            ))}
          </div>

          {/* If in preview mode: show device switcher */}
          {viewMode === "preview" && (
            <div className="ml-2 flex items-center gap-1 rounded-md bg-secondary/80 p-0.5 text-xs">
              {(
                [
                  { id: "desktop", label: "Desktop", icon: "💻" },
                  { id: "tablet", label: "Tablet", icon: "📱" },
                  { id: "mobile", label: "Celular", icon: "📲" },
                ] as const
              ).map((dev) => (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => onSetPreviewDevice(dev.id)}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 ${
                    previewDevice === dev.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{dev.icon}</span>
                  <span className="hidden sm:inline">{dev.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <TB title="Localizar e Substituir (Ctrl+F)" onClick={onOpenSearch}>
            🔍
          </TB>
          <DocumentOutline
            html={htmlContent}
            onInsertTOC={onInsertTOC}
            onJumpTo={onJumpToOutline}
          />
          <TB title="Meus Componentes Salvos" onClick={onOpenCustomComponents}>
            ⭐
          </TB>
          <TB title="Exportar Documento" onClick={onOpenExport}>
            📤
          </TB>
          <TB title="Importar Documento" onClick={onOpenImport}>
            📥
          </TB>
          <TB
            title="Painel de Propriedades Visuais (Ajustes Finos)"
            active={inspectorOpen}
            onClick={onToggleInspector}
          >
            ⚙️ <span className="hidden md:inline font-bold">Propriedades</span>
          </TB>
        </div>
      </div>

      {/* Main Editing Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 overflow-x-auto scrollbar-thin">
        {/* History / Undo / Redo / Format Painter */}
        <TB title="Desfazer (Ctrl+Z)" onClick={() => onExecCommand("undo")}>
          ↶
        </TB>
        <TB title="Refazer (Ctrl+Y)" onClick={() => onExecCommand("redo")}>
          ↷
        </TB>
        <TB
          title={hasCopiedStyle ? "Colar Estilo Copiado" : "Copiar Estilo do Elemento Selecionado"}
          active={hasCopiedStyle}
          onClick={hasCopiedStyle ? onPasteStyle : onCopyStyle}
        >
          🖌️
        </TB>
        <TB title="Limpar Formatação" onClick={() => onExecCommand("removeFormat")}>
          Tx
        </TB>

        <Divider />

        {/* Basic text styling */}
        <TB title="Negrito (Ctrl+B)" active={selectionState.bold} onClick={() => onExecCommand("bold")}>
          <strong>B</strong>
        </TB>
        <TB title="Itálico (Ctrl+I)" active={selectionState.italic} onClick={() => onExecCommand("italic")}>
          <em>I</em>
        </TB>
        <TB
          title="Sublinhado (Ctrl+U)"
          active={selectionState.underline}
          onClick={() => onExecCommand("underline")}
        >
          <span className="underline">U</span>
        </TB>
        <TB
          title="Tachado"
          active={selectionState.strike}
          onClick={() => onExecCommand("strikeThrough")}
        >
          <span className="line-through">S</span>
        </TB>
        <TB title="Sobrescrito" onClick={() => onExecCommand("superscript")}>
          x²
        </TB>
        <TB title="Subscrito" onClick={() => onExecCommand("subscript")}>
          x₂
        </TB>
        <TB title="Código inline" onClick={() => onInsertComponent("code-inline")}>
          &lt;/&gt;
        </TB>

        <Divider />

        {/* Font Select */}
        <select
          title="Família da Fonte"
          value=""
          onChange={(e) => e.target.value && onApplyFont(e.target.value)}
          className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary w-28 md:w-36"
        >
          <option value="">Fonte...</option>
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Size Select */}
        <select
          title="Tamanho da Fonte"
          value=""
          onChange={(e) => e.target.value && onApplyFontSize(e.target.value)}
          className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary w-20"
        >
          <option value="">Tam...</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Block Hierarchy Select */}
        <select
          title="Hierarquia de Bloco (H1-H6, P, etc.)"
          value=""
          onChange={(e) => e.target.value && onApplyBlock(e.target.value)}
          className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary w-28"
        >
          <option value="">Bloco...</option>
          {BLOCKS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <Divider />

        {/* Color Popover */}
        <ColorPickerPopover
          title="Cor do Texto"
          showGradientTab
          onPick={onApplyColor}
          label={<span className="font-bold text-xs">A●</span>}
        />

        {/* Background / Highlight Color Popover */}
        <ColorPickerPopover
          title="Cor de Fundo do Texto"
          showGradientTab
          onPick={onApplyHighlight}
          label={<span className="font-bold text-xs">▨</span>}
        />

        <Divider />

        {/* Alignment */}
        <TB title="Alinhar à Esquerda" onClick={() => onExecCommand("justifyLeft")}>
          ⇤
        </TB>
        <TB title="Alinhar ao Centro" onClick={() => onExecCommand("justifyCenter")}>
          ≡
        </TB>
        <TB title="Alinhar à Direita" onClick={() => onExecCommand("justifyRight")}>
          ⇥
        </TB>
        <TB title="Justificar" onClick={() => onExecCommand("justifyFull")}>
          ☰
        </TB>

        <Divider />

        {/* Lists & Indent */}
        <TB title="Lista com Marcadores" onClick={() => onExecCommand("insertUnorderedList")}>
          •—
        </TB>
        <TB title="Lista Numerada" onClick={() => onExecCommand("insertOrderedList")}>
          1—
        </TB>
        <TB title="Checklist" onClick={() => onInsertComponent("checklist")}>
          ☑—
        </TB>
        <TB title="Diminuir Recuo" onClick={() => onExecCommand("outdent")}>
          ⇠
        </TB>
        <TB title="Aumentar Recuo" onClick={() => onExecCommand("indent")}>
          ⇢
        </TB>

        <Divider />

        {/* + Adicionar Componente Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded bg-primary/20 border border-primary/50 px-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <span>+ Adicionar</span>
              <span className="text-[10px]">▼</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto z-50 bg-popover/95 backdrop-blur border border-border">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Componentes de Regras & RP
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("rule")}>
              <span className="mr-2">⚖️</span>
              <div className="flex flex-col">
                <span className="font-bold text-xs">Item de Regra (Código + Penalidade)</span>
                <span className="text-[10px] text-muted-foreground">Ex: 1.1 Metagaming + Status</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("penalty")}>
              <span className="mr-2">🛑</span>
              <div className="flex flex-col">
                <span className="font-bold text-xs">Cartão de Penalidade</span>
                <span className="text-[10px] text-muted-foreground">Banimento, Advertência, Perda</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("compare")}>
              <span className="mr-2">⚖️</span>
              <div className="flex flex-col">
                <span className="font-bold text-xs">Comparativo (Permitido vs Proibido)</span>
                <span className="text-[10px] text-muted-foreground">Grid em duas colunas</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Cards & Alertas
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("card-info")}>
              <span className="mr-2">🔵</span> Card de Informação
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-success")}>
              <span className="mr-2">🟢</span> Card de Sucesso / Permitido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-warning")}>
              <span className="mr-2">🟡</span> Card de Aviso / Atenção
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-danger")}>
              <span className="mr-2">🔴</span> Card de Perigo / Proibido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-critical")}>
              <span className="mr-2">🛑</span> Card Crítico / Importante
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-tip")}>
              <span className="mr-2">💡</span> Card de Dica de Roleplay
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Estruturas & Layout
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("accordion")}>
              <span className="mr-2">📑</span> Seção Expansível / Accordion
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("table")}>
              <span className="mr-2">▦</span> Tabela Visual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("stat")}>
              <span className="mr-2">#</span> Número em Destaque (Estatística)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("stat-battle")}>
              <span className="mr-2">⚔️</span> Destaque: Bandidos vs Polícia
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("badge")}>
              <span className="mr-2">🏷️</span> Etiqueta / Badge
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("divider-glow")}>
              <span className="mr-2">━</span> Divisor Luminoso Neon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("divider-icon")}>
              <span className="mr-2">✦</span> Divisor com Ícone Central
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("quote")}>
              <span className="mr-2">💬</span> Bloco de Citação com Autor
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Mídia & Links
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("image")}>
              <span className="mr-2">🖼️</span> Inserir Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("video")}>
              <span className="mr-2">🎬</span> Inserir Vídeo (YouTube/MP4)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("link")}>
              <span className="mr-2">🔗</span> Inserir Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("pagebreak")}>
              <span className="mr-2">⤓</span> Quebra de Página
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Emojis and Special Characters Picker */}
        <EmojiSpecialPicker onInsert={onInsertChar} />

        <Divider />

        {/* Direct quick inserts */}
        <TB title="Inserir Link" onClick={() => onInsertComponent("link")}>
          🔗
        </TB>
        <TB title="Inserir Imagem" onClick={() => onInsertComponent("image")}>
          🖼️
        </TB>
        <TB title="Inserir Tabela" onClick={() => onInsertComponent("table")}>
          ▦
        </TB>
        <TB title="Divisor Decorativo" onClick={() => onInsertComponent("divider-icon")}>
          —✦—
        </TB>
      </div>
    </div>
  );
}
