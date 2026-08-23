import React, { useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeftRight,
  Ban,
  Baseline,
  Bold,
  Braces,
  CheckCircle2,
  Code,
  Eye,
  FileCode,
  Film,
  Hash,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Info,
  Italic,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  List,
  Minus,
  Monitor,
  Paintbrush,
  Palette,
  PencilLine,
  Plus,
  Quote,
  RemoveFormatting,
  Scissors,
  Scale,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkle,
  Sparkles,
  Star,
  Strikethrough,
  Subscript,
  Superscript,
  Swords,
  Tablet,
  Tag,
  Table,
  Trash2,
  TriangleAlert,
  Underline,
  Undo2,
  Redo2,
  Upload,
  Download,
  XCircle,
  Zap,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { EmojiSpecialPicker } from "./EmojiSpecialPicker";
import { DocumentOutline } from "./DocumentOutline";
import { BLOCKS, FONTS, FONT_SIZES } from "./editor-constants";
import type { EditorViewMode, PreviewDevice, SelectionFormatState } from "./editor-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  onApplyColor: (color: string, isGradient?: boolean) => void;
  onApplyHighlight: (color: string, isGradient?: boolean) => void;
  onRecolorElement: () => void;
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
  onRecolorElement,
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
    danger,
    children,
  }: {
    onClick: () => void;
    title: string;
    active?: boolean;
    disabled?: boolean;
    danger?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : danger
            ? "text-destructive/90 hover:bg-destructive/10 hover:text-destructive"
            : "text-foreground/80 hover:bg-secondary hover:text-foreground"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {children}
    </button>
  );

  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [customSize, setCustomSize] = useState("16");

  const applyCustomSize = () => {
    const parsed = Number(customSize);
    if (!Number.isFinite(parsed) || parsed < 8 || parsed > 200) return;
    onApplyFontSize(`${Math.round(parsed)}px`);
    setCustomSizeOpen(false);
  };

  const Divider = () => (
    <span className="mx-1.5 h-6 w-px shrink-0 bg-gradient-to-b from-transparent via-border to-transparent" />
  );
  const Ico = ({ children }: { children: React.ReactNode }) => (
    <span className="[&>svg]:h-4 [&>svg]:w-4">{children}</span>
  );
  const MIcon = ({ children }: { children: React.ReactNode }) => (
    <span className="mr-2 flex h-4 w-4 shrink-0 items-center justify-center text-primary/80 [&>svg]:h-4 [&>svg]:w-4">
      {children}
    </span>
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-t-xl border-b border-border bg-secondary/40 shadow-sm backdrop-blur-sm">
      {/* Upper bar: View mode tabs, preview viewport, tools and inspector trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-background/40 px-3 py-1.5">
        <div className="flex items-center gap-1">
          {/* Editor view modes */}
          <div className="flex rounded-lg bg-secondary/60 p-0.5 text-xs font-semibold">
            {(
              [
                { id: "visual", label: "Visual", icon: <PencilLine className="h-3.5 w-3.5" /> },
                { id: "preview", label: "Preview", icon: <Eye className="h-3.5 w-3.5" /> },
                { id: "html", label: "HTML", icon: <FileCode className="h-3.5 w-3.5" /> },
                { id: "json", label: "JSON", icon: <Braces className="h-3.5 w-3.5" /> },
              ] as const
            ).map((vm) => (
              <button
                key={vm.id}
                type="button"
                onClick={() => onSetViewMode(vm.id)}
                title={
                  vm.id === "visual"
                    ? "Editor Visual (WYSIWYG)"
                    : vm.id === "preview"
                      ? "Pré-visualização real do site"
                      : vm.id === "html"
                        ? "Código-fonte HTML"
                        : "Estrutura JSON do documento"
                }
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
                  viewMode === vm.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {vm.icon}
                <span>{vm.label}</span>
              </button>
            ))}
          </div>

          {/* If in preview mode: show device switcher */}
          {viewMode === "preview" && (
            <div className="ml-2 flex items-center gap-1 rounded-md bg-secondary/80 p-0.5 text-xs">
              {(
                [
                  { id: "desktop", label: "Desktop", icon: <Monitor className="h-3.5 w-3.5" /> },
                  { id: "tablet", label: "Tablet", icon: <Tablet className="h-3.5 w-3.5" /> },
                  { id: "mobile", label: "Celular", icon: <Smartphone className="h-3.5 w-3.5" /> },
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
                  {dev.icon}
                  <span className="hidden sm:inline">{dev.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <TB title="Localizar e Substituir (Ctrl+F)" onClick={onOpenSearch}>
            <Ico>
              <Search />
            </Ico>
          </TB>
          <DocumentOutline
            html={htmlContent}
            onInsertTOC={onInsertTOC}
            onJumpTo={onJumpToOutline}
          />
          <TB title="Meus Componentes Salvos" onClick={onOpenCustomComponents}>
            <Ico>
              <Star />
            </Ico>
          </TB>
          <TB title="Exportar Documento" onClick={onOpenExport}>
            <Ico>
              <Upload />
            </Ico>
          </TB>
          <TB title="Importar Documento" onClick={onOpenImport}>
            <Ico>
              <Download />
            </Ico>
          </TB>
          <TB title="Limpar todo o documento" danger onClick={onClearDocument}>
            <Ico>
              <Trash2 />
            </Ico>
          </TB>
          <span className="mx-0.5 h-5 w-px bg-border/60" />
          <TB
            title="Painel de Propriedades Visuais (Ajustes Finos)"
            active={inspectorOpen}
            onClick={onToggleInspector}
          >
            <Ico>
              <SlidersHorizontal />
            </Ico>
            <span className="hidden font-bold md:inline">Propriedades</span>
          </TB>
        </div>
      </div>

      {/* Main Editing Toolbar */}
      <div className="scrollbar-thin flex flex-wrap items-center gap-1 overflow-x-auto bg-gradient-to-b from-secondary/50 to-background/20 px-3 py-2.5">
        {/* History / Undo / Redo / Format Painter */}
        <TB title="Desfazer (Ctrl+Z)" onClick={() => onExecCommand("undo")}>
          <Ico>
            <Undo2 />
          </Ico>
        </TB>
        <TB title="Refazer (Ctrl+Y)" onClick={() => onExecCommand("redo")}>
          <Ico>
            <Redo2 />
          </Ico>
        </TB>
        <TB
          title={hasCopiedStyle ? "Colar Estilo Copiado" : "Copiar Estilo do Elemento Selecionado"}
          active={hasCopiedStyle}
          onClick={hasCopiedStyle ? onPasteStyle : onCopyStyle}
        >
          <Ico>
            <Paintbrush />
          </Ico>
        </TB>
        <TB title="Limpar formatação da seleção" onClick={() => onExecCommand("removeFormat")}>
          <Ico>
            <RemoveFormatting />
          </Ico>
        </TB>

        <Divider />

        {/* Basic text styling */}
        <TB
          title="Negrito (Ctrl+B)"
          active={selectionState.bold}
          onClick={() => onExecCommand("bold")}
        >
          <Ico>
            <Bold />
          </Ico>
        </TB>
        <TB
          title="Itálico (Ctrl+I)"
          active={selectionState.italic}
          onClick={() => onExecCommand("italic")}
        >
          <Ico>
            <Italic />
          </Ico>
        </TB>
        <TB
          title="Sublinhado (Ctrl+U)"
          active={selectionState.underline}
          onClick={() => onExecCommand("underline")}
        >
          <Ico>
            <Underline />
          </Ico>
        </TB>
        <TB
          title="Tachado"
          active={selectionState.strike}
          onClick={() => onExecCommand("strikeThrough")}
        >
          <Ico>
            <Strikethrough />
          </Ico>
        </TB>
        <TB title="Sobrescrito" onClick={() => onExecCommand("superscript")}>
          <Ico>
            <Superscript />
          </Ico>
        </TB>
        <TB title="Subscrito" onClick={() => onExecCommand("subscript")}>
          <Ico>
            <Subscript />
          </Ico>
        </TB>
        <TB title="Código inline" onClick={() => onInsertComponent("code-inline")}>
          <Ico>
            <Code />
          </Ico>
        </TB>

        <Divider />

        {/* Font Select */}
        <select
          title="Família da Fonte"
          value=""
          onChange={(e) => e.target.value && onApplyFont(e.target.value)}
          className="h-8 w-28 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary md:w-36"
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
          className="h-8 w-20 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
        >
          <option value="">Tam...</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Custom Size */}
        <Popover open={customSizeOpen} onOpenChange={setCustomSizeOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Tamanho personalizado (px)"
              aria-label="Tamanho personalizado da fonte"
              onMouseDown={(e) => e.preventDefault()}
              className="flex h-8 items-center rounded border border-border bg-background px-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              px
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-48 p-3"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tamanho personalizado
              </p>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={8}
                  max={200}
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCustomSize();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
              <Button type="button" size="sm" className="w-full text-xs" onClick={applyCustomSize}>
                Aplicar tamanho
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Valores de 8 a 200 pixels · selecione o texto antes de aplicar.
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Block Hierarchy Select */}
        <select
          title="Hierarquia de Bloco (H1-H6, P, etc.)"
          value=""
          onChange={(e) => e.target.value && onApplyBlock(e.target.value)}
          className="h-8 w-28 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
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
          label={
            <span className="flex flex-col items-center leading-none">
              <Baseline className="h-4 w-4" />
              <span className="mt-0.5 h-1 w-3 rounded-full bg-gradient-to-r from-violet-400 to-pink-400" />
            </span>
          }
        />

        {/* Background / Highlight Color Popover */}
        <ColorPickerPopover
          title="Cor de Fundo do Texto"
          showGradientTab
          onPick={onApplyHighlight}
          label={
            <Ico>
              <Highlighter />
            </Ico>
          }
        />

        {/* Component Recolor */}
        <TB
          title="Cor do Componente (tabela, listas, cards, divisores…)"
          onClick={onRecolorElement}
        >
          <Ico>
            <Palette />
          </Ico>
        </TB>

        <Divider />

        {/* Alignment */}
        <TB title="Alinhar à Esquerda" onClick={() => onExecCommand("justifyLeft")}>
          <Ico>
            <AlignLeft />
          </Ico>
        </TB>
        <TB title="Centralizar" onClick={() => onExecCommand("justifyCenter")}>
          <Ico>
            <AlignCenter />
          </Ico>
        </TB>
        <TB title="Alinhar à Direita" onClick={() => onExecCommand("justifyRight")}>
          <Ico>
            <AlignRight />
          </Ico>
        </TB>
        <TB title="Justificar" onClick={() => onExecCommand("justifyFull")}>
          <Ico>
            <AlignJustify />
          </Ico>
        </TB>

        <Divider />

        {/* Lists & Indent */}
        <TB
          title="Lista com Marcadores"
          active={selectionState.bulletList}
          onClick={() => onExecCommand("insertUnorderedList")}
        >
          <Ico>
            <List />
          </Ico>
        </TB>
        <TB
          title="Lista Numerada"
          active={selectionState.numberedList}
          onClick={() => onExecCommand("insertOrderedList")}
        >
          <Ico>
            <ListOrdered />
          </Ico>
        </TB>
        <TB title="Checklist" onClick={() => onInsertComponent("checklist")}>
          <Ico>
            <ListChecks />
          </Ico>
        </TB>
        <TB title="Diminuir Recuo" onClick={() => onExecCommand("outdent")}>
          <Ico>
            <IndentDecrease />
          </Ico>
        </TB>
        <TB title="Aumentar Recuo" onClick={() => onExecCommand("indent")}>
          <Ico>
            <IndentIncrease />
          </Ico>
        </TB>

        <Divider />

        {/* Blocos prontos de Regras (layout do site) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-md border border-primary bg-primary px-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:brightness-110"
            >
              <Scale className="h-4 w-4" />
              <span>Blocos de Regras</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-50 max-h-96 w-72 overflow-y-auto border border-border bg-popover/95 backdrop-blur">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estrutura das regras
            </DropdownMenuLabel>
            {(
              [
                ["bc-section", "Seção completa (título + regras)", "Ex.: 1. Acesso à Cidade", <Layers key="i" />],
                ["bc-rule", "Item de regra (1.1 – texto)", "Número em vermelho + texto", <Scale key="i" />],
                ["bc-rule-sub", "Item de regra com subitens a) b)", "Regra com alíneas", <List key="i" />],
                ["bc-arrows", "Lista com setas ➤", "Setas vermelhas do site", <ListChecks key="i" />],
              ] as const
            ).map(([key, label, desc, icon]) => (
              <DropdownMenuItem key={key} onClick={() => onInsertComponent(key)}>
                <MIcon>{icon}</MIcon>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Caixas de destaque
            </DropdownMenuLabel>
            {(
              [
                ["bc-important", "Caixa IMPORTANTE", "Faixa vermelha centralizada", <TriangleAlert key="i" />],
                ["bc-obs", "Caixa OBS", "Observação tracejada", <Info key="i" />],
                ["bc-consequence", "Caixa CONSEQUÊNCIA", "Punição da regra", <Ban key="i" />],
                ["bc-time", "Caixa de tempo / limite", "Ex.: Tempo Máximo", <Zap key="i" />],
                ["bc-hl", "Destaque no texto", "Realce vermelho arredondado", <Highlighter key="i" />],
              ] as const
            ).map(([key, label, desc, icon]) => (
              <DropdownMenuItem key={key} onClick={() => onInsertComponent(key)}>
                <MIcon>{icon}</MIcon>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ações do servidor
            </DropdownMenuLabel>
            {(
              [
                ["bc-action", "Ação expansível (menu)", "Emoji + participantes + regras", <Swords key="i" />],
                ["bc-participants", "Caixa de participantes", "💀 Bandidos / 🚔 Polícia", <Sparkles key="i" />],
              ] as const
            ).map(([key, label, desc, icon]) => (
              <DropdownMenuItem key={key} onClick={() => onInsertComponent(key)}>
                <MIcon>{icon}</MIcon>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Divider />

        {/* + Adicionar Componente Dropdown */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded border border-primary/50 bg-primary/20 px-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-50 max-h-96 w-64 overflow-y-auto border border-border bg-popover/95 backdrop-blur"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Regras &amp; RP
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("rule")}>
              <MIcon>
                <Scale />
              </MIcon>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Item de Regra (Código + Penalidade)</span>
                <span className="text-[10px] text-muted-foreground">
                  Ex: 1.1 Metagaming + Status
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("penalty")}>
              <MIcon>
                <Ban />
              </MIcon>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Cartão de Penalidade</span>
                <span className="text-[10px] text-muted-foreground">
                  Banimento, Advertência, Perda
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("compare")}>
              <MIcon>
                <ArrowLeftRight />
              </MIcon>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Comparativo (Permitido vs Proibido)</span>
                <span className="text-[10px] text-muted-foreground">Grid em duas colunas</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Cards &amp; Alertas
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("card-info")}>
              <MIcon>
                <Info />
              </MIcon>
              Card de Informação
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-success")}>
              <MIcon>
                <CheckCircle2 />
              </MIcon>
              Card de Sucesso / Permitido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-warning")}>
              <MIcon>
                <TriangleAlert />
              </MIcon>
              Card de Aviso / Atenção
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-danger")}>
              <MIcon>
                <XCircle />
              </MIcon>
              Card de Perigo / Proibido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-critical")}>
              <MIcon>
                <Zap />
              </MIcon>
              Card Crítico / Importante
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("card-tip")}>
              <MIcon>
                <Lightbulb />
              </MIcon>
              Card de Dica de Roleplay
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Estruturas &amp; Layout
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("accordion")}>
              <MIcon>
                <Layers />
              </MIcon>
              Seção Expansível / Accordion
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("table")}>
              <MIcon>
                <Table />
              </MIcon>
              Tabela Visual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("stat")}>
              <MIcon>
                <Hash />
              </MIcon>
              Número em Destaque (Estatística)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("stat-battle")}>
              <MIcon>
                <Swords />
              </MIcon>
              Destaque: Bandidos vs Polícia
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("badge")}>
              <MIcon>
                <Tag />
              </MIcon>
              Etiqueta / Badge
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("divider-glow")}>
              <MIcon>
                <Sparkles />
              </MIcon>
              Divisor Luminoso Neon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("divider-icon")}>
              <MIcon>
                <Sparkle />
              </MIcon>
              Divisor com Ícone Central
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("quote")}>
              <MIcon>
                <Quote />
              </MIcon>
              Bloco de Citação com Autor
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Mídia &amp; Links
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onInsertComponent("image")}>
              <MIcon>
                <ImagePlus />
              </MIcon>
              Inserir Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("video")}>
              <MIcon>
                <Film />
              </MIcon>
              Inserir Vídeo (YouTube/MP4)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("link")}>
              <MIcon>
                <Link2 />
              </MIcon>
              Inserir Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertComponent("pagebreak")}>
              <MIcon>
                <Scissors />
              </MIcon>
              Quebra de Página
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Emojis and Special Characters Picker */}
        <EmojiSpecialPicker onInsert={onInsertChar} />

        <Divider />

        {/* Direct quick inserts */}
        <TB title="Inserir Link" onClick={() => onInsertComponent("link")}>
          <Ico>
            <Link2 />
          </Ico>
        </TB>
        <TB title="Inserir Imagem" onClick={() => onInsertComponent("image")}>
          <Ico>
            <ImagePlus />
          </Ico>
        </TB>
        <TB title="Inserir Tabela" onClick={() => onInsertComponent("table")}>
          <Ico>
            <Table />
          </Ico>
        </TB>
        <TB title="Divisor Decorativo" onClick={() => onInsertComponent("divider-icon")}>
          <Ico>
            <Minus />
          </Ico>
        </TB>
      </div>
    </div>
  );
}
