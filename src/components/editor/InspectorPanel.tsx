import { useState } from "react";
import {
  FONTS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
  NEON_PRESETS,
} from "./editor-constants";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InspectorTab =
  | "conteudo"
  | "tipografia"
  | "cores"
  | "brilho"
  | "contorno"
  | "sombra"
  | "fundo"
  | "borda"
  | "espacamento"
  | "animacao"
  | "presets";

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (property: string, value: string) => void;
  onApplyBatchStyles: (styles: Record<string, string>) => void;
  onWrapWithCustomTag: (tag: string, styles: Record<string, string>, className?: string) => void;
  onApplyThemePreset: (presetName: string) => void;
}

export function InspectorPanel({
  isOpen,
  onClose,
  onApplyStyle,
  onApplyBatchStyles,
  onWrapWithCustomTag,
  onApplyThemePreset,
}: InspectorPanelProps) {
  const [tab, setTab] = useState<InspectorTab>("tipografia");

  // Typography state
  const [fontFamily, setFontFamily] = useState("inherit");
  const [fontSize, setFontSize] = useState("16px");
  const [fontWeight, setFontWeight] = useState("400");
  const [letterSpacing, setLetterSpacing] = useState("normal");
  const [lineHeight, setLineHeight] = useState("1.5");
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase" | "capitalize">("none");

  // Glow state
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [glowColor, setGlowColor] = useState("#8b5cf6");
  const [glowBlur, setGlowBlur] = useState(6);
  const [glowLayers, setGlowLayers] = useState(1);

  // Stroke / Outline state
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [strokeColor, setStrokeColor] = useState("#ffffff");

  // Shadow state
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState(2);
  const [shadowY, setShadowY] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(8);
  const [shadowColor, setShadowColor] = useState("rgba(0,0,0,0.6)");

  // Background & Glass state
  const [bgType, setBgType] = useState<"solid" | "glass" | "gradient">("solid");
  const [bgColor, setBgColor] = useState("transparent");
  const [glassBlur, setGlassBlur] = useState(12);
  const [borderRadius, setBorderRadius] = useState(8);
  const [boxPadding, setBoxPadding] = useState(12);

  // Border state
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderStyle, setBorderStyle] = useState<string>("solid");
  const [borderColor, setBorderColor] = useState("#8b5cf6");

  // Spacing state
  const [marginTop, setMarginTop] = useState(0);
  const [marginBottom, setMarginBottom] = useState(12);

  // Content custom wrapper
  const [customTag, setCustomTag] = useState("div");
  const [customTitle, setCustomTitle] = useState("");
  const [customIcon, setCustomIcon] = useState("");

  if (!isOpen) return null;

  const handleApplyGlow = (enabled: boolean, color: string, blur: number, layers: number) => {
    setGlowEnabled(enabled);
    if (!enabled) {
      onApplyStyle("text-shadow", "none");
      return;
    }
    // Camadas enormes se sobrepunham ao preenchimento das letras e deixavam o texto borrado.
    // Mantemos um halo curto, com um núcleo nítido, para o neon continuar legível.
    const softBlur = Math.max(2, Math.min(14, blur));
    const shadows = [`0 0 1px ${color}`, `0 0 ${softBlur}px ${color}`];
    if (layers > 1) shadows.push(`0 0 ${Math.min(18, softBlur + 4)}px ${color}`);
    onApplyBatchStyles({
      "text-shadow": shadows.join(", "),
      filter: "none",
      "text-rendering": "geometricPrecision",
    });
  };

  const handleApplyStroke = (enabled: boolean, width: number, color: string) => {
    setStrokeEnabled(enabled);
    if (!enabled) {
      onApplyBatchStyles({
        "-webkit-text-stroke": "0px transparent",
      });
      return;
    }
    onApplyBatchStyles({
      "-webkit-text-stroke": `${width}px ${color}`,
    });
  };

  const handleApplyShadow = (enabled: boolean, x: number, y: number, blur: number, color: string) => {
    setShadowEnabled(enabled);
    if (!enabled) {
      onApplyStyle("text-shadow", "none");
      return;
    }
    onApplyStyle("text-shadow", `${x}px ${y}px ${blur}px ${color}`);
  };

  const handleApplyBackground = () => {
    if (bgType === "glass") {
      onApplyBatchStyles({
        background: "rgba(255, 255, 255, 0.05)",
        "backdrop-filter": `blur(${glassBlur}px)`,
        "-webkit-backdrop-filter": `blur(${glassBlur}px)`,
        "border-radius": `${borderRadius}px`,
        padding: `${boxPadding}px`,
      });
    } else {
      onApplyBatchStyles({
        background: bgColor,
        "border-radius": `${borderRadius}px`,
        padding: `${boxPadding}px`,
      });
    }
  };

  const handleApplyBorder = () => {
    onApplyBatchStyles({
      "border-width": `${borderWidth}px`,
      "border-style": borderStyle,
      "border-color": borderColor,
      "border-radius": `${borderRadius}px`,
    });
  };

  const tabs: { key: InspectorTab; label: string; icon: string }[] = [
    { key: "tipografia", label: "Tipografia", icon: "T" },
    { key: "cores", label: "Cores", icon: "🎨" },
    { key: "brilho", label: "Brilho", icon: "✨" },
    { key: "contorno", label: "Contorno", icon: "⭕" },
    { key: "sombra", label: "Sombra", icon: "🌫️" },
    { key: "fundo", label: "Fundo & Glass", icon: "▨" },
    { key: "borda", label: "Moldura", icon: "▭" },
    { key: "espacamento", label: "Espaçamento", icon: "↔" },
    { key: "animacao", label: "Animação", icon: "⚡" },
    { key: "presets", label: "Presets de Tema", icon: "👑" },
  ];

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-40 w-80 md:w-96 flex flex-col border-l border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/30">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm uppercase tracking-wider text-primary">
            Painel de Propriedades
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* Tabs navigation bar */}
      <div className="flex overflow-x-auto border-b border-border bg-background/50 p-1 text-xs scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB TIPOGRAFIA */}
        {tab === "tipografia" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Família da Fonte
              </Label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  onApplyStyle("font-family", e.target.value);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
              >
                {FONTS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tamanho
                </Label>
                <select
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    onApplyStyle("font-size", e.target.value);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  {FONT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Peso
                </Label>
                <select
                  value={fontWeight}
                  onChange={(e) => {
                    setFontWeight(e.target.value);
                    onApplyStyle("font-weight", e.target.value);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.label} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Espaçamento
                </Label>
                <select
                  value={letterSpacing}
                  onChange={(e) => {
                    setLetterSpacing(e.target.value);
                    onApplyStyle("letter-spacing", e.target.value);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  {LETTER_SPACINGS.map((ls) => (
                    <option key={ls.label} value={ls.value}>
                      {ls.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Altura da Linha
                </Label>
                <select
                  value={lineHeight}
                  onChange={(e) => {
                    setLineHeight(e.target.value);
                    onApplyStyle("line-height", e.target.value);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  {LINE_HEIGHTS.map((lh) => (
                    <option key={lh.label} value={lh.value}>
                      {lh.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Transformação de Texto
              </Label>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { label: "Aa", value: "none" },
                    { label: "AA", value: "uppercase" },
                    { label: "aa", value: "lowercase" },
                    { label: "Abc", value: "capitalize" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setTextTransform(t.value);
                      onApplyStyle("text-transform", t.value);
                    }}
                    className={`rounded border py-1 text-xs font-bold ${
                      textTransform === t.value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CORES */}
        {tab === "cores" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cor do Texto
              </Label>
              <ColorPickerPopover
                title="Cor do Texto"
                showGradientTab
                onPick={(col, isGrad) => {
                  if (isGrad) {
                    onApplyBatchStyles({
                      background: col,
                      "-webkit-background-clip": "text",
                      "-webkit-text-fill-color": "transparent",
                      display: "inline-block",
                    });
                  } else {
                    onApplyBatchStyles({
                      color: col,
                      "-webkit-text-fill-color": col,
                      background: "none",
                      "-webkit-background-clip": "unset",
                    });
                  }
                }}
              >
                <div className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-xs hover:border-primary">
                  <span>Selecionar cor do texto...</span>
                  <span className="h-5 w-5 rounded-full border border-border bg-primary" />
                </div>
              </ColorPickerPopover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cor de Fundo da Seleção
              </Label>
              <ColorPickerPopover
                title="Cor de Fundo"
                onPick={(col) => onApplyStyle("background-color", col)}
              >
                <div className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-xs hover:border-primary">
                  <span>Selecionar cor de fundo...</span>
                  <span className="h-5 w-5 rounded border border-border bg-secondary" />
                </div>
              </ColorPickerPopover>
            </div>
          </div>
        )}

        {/* TAB BRILHO / GLOW */}
        {tab === "brilho" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">Ativar Brilho (Glow)</Label>
              <input
                type="checkbox"
                checked={glowEnabled}
                onChange={(e) => handleApplyGlow(e.target.checked, glowColor, glowBlur, glowLayers)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {glowEnabled && (
              <div className="space-y-4">
                {/* Neon Presets */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Presets Neon Rápidos
                  </Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {NEON_PRESETS.map((np) => (
                      <button
                        key={np.name}
                        type="button"
                        onClick={() => {
                          setGlowColor(np.color);
                          handleApplyGlow(true, np.color, glowBlur, glowLayers);
                        }}
                        className="rounded border border-border p-1.5 text-center text-[10px] font-bold transition-transform hover:scale-105"
                        style={{ color: np.color, textShadow: np.shadow }}
                      >
                        {np.name.replace("Neon ", "")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cor do Brilho
                  </Label>
                  <ColorPickerPopover
                    title="Cor do Brilho"
                    color={glowColor}
                    onPick={(col) => {
                      setGlowColor(col);
                      handleApplyGlow(true, col, glowBlur, glowLayers);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Raio do Brilho</span>
                    <span>{glowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={glowBlur}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGlowBlur(v);
                      handleApplyGlow(true, glowColor, v, glowLayers);
                    }}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Camadas de Intensidade</span>
                    <span>{glowLayers}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    value={glowLayers}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGlowLayers(v);
                      handleApplyGlow(true, glowColor, glowBlur, v);
                    }}
                    className="w-full accent-primary"
                  />
                </div>

                <div
                  className="rounded-lg border border-border/80 p-3 text-center text-sm font-bold"
                  style={{
                    color: glowColor,
                    textShadow: `0 0 1px ${glowColor}, 0 0 ${Math.min(14, glowBlur)}px ${glowColor}`,
                  }}
                >
                  Texto com Brilho Neon Ativado
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => handleApplyGlow(false, glowColor, glowBlur, glowLayers)}>
                  Remover brilho do texto selecionado
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTORNO / STROKE */}
        {tab === "contorno" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">Contorno de Texto</Label>
              <input
                type="checkbox"
                checked={strokeEnabled}
                onChange={(e) => handleApplyStroke(e.target.checked, strokeWidth, strokeColor)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {strokeEnabled && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Espessura</span>
                    <span>{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setStrokeWidth(v);
                      handleApplyStroke(true, v, strokeColor);
                    }}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cor do Contorno
                  </Label>
                  <ColorPickerPopover
                    title="Cor do Contorno"
                    color={strokeColor}
                    onPick={(col) => {
                      setStrokeColor(col);
                      handleApplyStroke(true, strokeWidth, col);
                    }}
                  />
                </div>

                <div
                  className="rounded-lg border border-border/80 p-3 text-center text-lg font-bold"
                  style={{
                    WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
                    color: "transparent",
                  }}
                >
                  CONTORNO DE TEXTO
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB SOMBRA */}
        {tab === "sombra" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Label className="text-xs font-semibold uppercase tracking-wider">Sombra de Texto</Label>
              <input
                type="checkbox"
                checked={shadowEnabled}
                onChange={(e) =>
                  handleApplyShadow(e.target.checked, shadowX, shadowY, shadowBlur, shadowColor)
                }
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {shadowEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Deslocamento X ({shadowX}px)</Label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={shadowX}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setShadowX(v);
                        handleApplyShadow(true, v, shadowY, shadowBlur, shadowColor);
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Deslocamento Y ({shadowY}px)</Label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={shadowY}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setShadowY(v);
                        handleApplyShadow(true, shadowX, v, shadowBlur, shadowColor);
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Blur ({shadowBlur}px)</Label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={shadowBlur}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setShadowBlur(v);
                      handleApplyShadow(true, shadowX, shadowY, v, shadowColor);
                    }}
                    className="w-full accent-primary"
                  />
                </div>

                <ColorPickerPopover
                  title="Cor da Sombra"
                  color={shadowColor}
                  onPick={(col) => {
                    setShadowColor(col);
                    handleApplyShadow(true, shadowX, shadowY, shadowBlur, col);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB FUNDO & GLASS */}
        {tab === "fundo" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estilo de Fundo
              </Label>
              <div className="grid grid-cols-3 gap-1">
                {(["solid", "glass", "gradient"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBgType(t)}
                    className={`rounded border py-1.5 text-xs font-semibold uppercase ${
                      bgType === t
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {t === "solid" ? "Sólido" : t === "glass" ? "Glass" : "Gradiente"}
                  </button>
                ))}
              </div>
            </div>

            {bgType === "glass" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Desfoque do Vidro ({glassBlur}px)</Label>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    value={glassBlur}
                    onChange={(e) => setGlassBlur(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            ) : (
              <ColorPickerPopover
                title="Cor de Fundo"
                showGradientTab
                color={bgColor}
                onPick={(col) => setBgColor(col)}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Arredondamento ({borderRadius}px)</Label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Espaçamento Interno ({boxPadding}px)</Label>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={boxPadding}
                  onChange={(e) => setBoxPadding(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <Button type="button" size="sm" onClick={handleApplyBackground} className="w-full">
              Aplicar Fundo
            </Button>
          </div>
        )}

        {/* TAB BORDA / MOLDURA */}
        {tab === "borda" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Espessura da Borda</span>
                <span>{borderWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estilo da Borda
              </Label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="solid">Sólido</option>
                <option value="dashed">Tracejado</option>
                <option value="dotted">Pontilhado</option>
                <option value="double">Duplo</option>
                <option value="groove">Groove</option>
                <option value="ridge">Ridge</option>
                <option value="none">Nenhum</option>
              </select>
            </div>

            <ColorPickerPopover
              title="Cor da Borda"
              color={borderColor}
              onPick={(col) => setBorderColor(col)}
            />

            <Button type="button" size="sm" onClick={handleApplyBorder} className="w-full">
              Aplicar Moldura
            </Button>
          </div>
        )}

        {/* TAB ESPAÇAMENTO */}
        {tab === "espacamento" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Margem Superior</span>
                <span>{marginTop}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={marginTop}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMarginTop(v);
                  onApplyStyle("margin-top", `${v}px`);
                }}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Margem Inferior</span>
                <span>{marginBottom}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={marginBottom}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMarginBottom(v);
                  onApplyStyle("margin-bottom", `${v}px`);
                }}
                className="w-full accent-primary"
              />
            </div>
          </div>
        )}

        {/* TAB ANIMAÇÃO */}
        {tab === "animacao" && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Animações Especiais
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Pulso Suave", cls: "rc-anim-pulse" },
                { name: "Brilho Neon", cls: "rc-anim-glow" },
                { name: "Fade In", cls: "rc-anim-fade" },
                { name: "Slide Up", cls: "rc-anim-slide" },
                { name: "Sem Animação", cls: "" },
              ].map((a) => (
                <Button
                  key={a.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyStyle("animation", a.cls)}
                  className="text-xs font-semibold"
                >
                  {a.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* TAB PRESETS DE TEMA */}
        {tab === "presets" && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Presets de Identidade Visual
            </Label>
            <div className="space-y-2">
              {[
                { name: "Dark RP (Padrão)", color: "#8b5cf6", desc: "Fundo escuro, títulos roxos e glow suave" },
                { name: "Polícia & Tático", color: "#3b82f6", desc: "Azul marinho, distintivos e linhas táticas" },
                { name: "Hospital & SAMU", color: "#ef4444", desc: "Vermelho médico, cruzes e alertas sanitários" },
                { name: "Ilegal & Facções", color: "#dc2626", desc: "Vermelho sangue, caveiras e caixas escuras" },
                { name: "Cyberpunk Neon", color: "#06b6d4", desc: "Ciano + Rosa Neon vibrante e sombras duplas" },
                { name: "Ouro & Prestígio", color: "#eab308", desc: "Dourado reluzente para regras VIP/Termos" },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onApplyThemePreset(p.name)}
                  className="flex w-full flex-col rounded-lg border border-border p-3 text-left transition-colors hover:border-primary bg-background/50"
                >
                  <span className="font-bold text-xs" style={{ color: p.color }}>
                    {p.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
