import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DOCUMENT_PALETTES, GRADIENT_PRESETS, SWATCH_COLORS } from "./editor-constants";
import { Button } from "@/components/ui/button";

interface ColorPickerPopoverProps {
  label?: React.ReactNode;
  title: string;
  color?: string;
  showGradientTab?: boolean;
  onPick: (color: string, isGradient?: boolean) => void;
  children?: React.ReactNode;
}

export function ColorPickerPopover({
  label,
  title,
  color = "#ffffff",
  showGradientTab = false,
  onPick,
  children,
}: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">("solid");
  const [currentHex, setCurrentHex] = useState(color.startsWith("#") ? color : "#8b5cf6");
  const [alpha, setAlpha] = useState(100);
  const [gradAngle, setGradAngle] = useState(135);
  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [gradFrom, setGradFrom] = useState("#8b5cf6");
  const [gradTo, setGradTo] = useState("#ec4899");

  const buildCurrentColor = (hex: string, a: number) => {
    if (a >= 100) return hex;
    const alphaHex = Math.round((a / 100) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex}${alphaHex}`;
  };

  const applySolid = (hex: string, a: number = alpha) => {
    setCurrentHex(hex);
    const finalColor = buildCurrentColor(hex, a);
    onPick(finalColor, false);
  };

  const applyGradient = (
    type: "linear" | "radial" = gradType,
    angle: number = gradAngle,
    from: string = gradFrom,
    to: string = gradTo
  ) => {
    const gradStr =
      type === "linear"
        ? `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`
        : `radial-gradient(circle, ${from} 0%, ${to} 100%)`;
    onPick(gradStr, true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            title={title}
            aria-label={title}
            className="flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
          >
            {label || (
              <span className="flex items-center gap-1">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ background: color }}
                />
                <span>Cor</span>
              </span>
            )}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-3 bg-popover/95 backdrop-blur border border-border shadow-2xl z-50"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            {showGradientTab && (
              <div className="flex rounded-md bg-secondary/60 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("solid")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    activeTab === "solid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sólida
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("gradient")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    activeTab === "gradient"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Gradiente
                </button>
              </div>
            )}
          </div>

          {activeTab === "solid" ? (
            <div className="space-y-3">
              {/* Visual preview and HEX picker */}
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md border border-border">
                  <input
                    type="color"
                    aria-label="Selecionar cor do sistema"
                    value={currentHex.slice(0, 7)}
                    onChange={(e) => applySolid(e.target.value)}
                    className="absolute -top-2 -left-2 h-14 w-16 cursor-pointer opacity-0"
                  />
                  <div
                    className="h-full w-full"
                    style={{ background: buildCurrentColor(currentHex, alpha) }}
                  />
                </div>
                <div className="flex flex-1 items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1">
                  <span className="text-xs font-mono text-muted-foreground">#</span>
                  <input
                    type="text"
                    value={currentHex.replace("#", "").slice(0, 8)}
                    onChange={(e) => {
                      const val = `#${e.target.value}`;
                      setCurrentHex(val);
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        applySolid(val);
                      }
                    }}
                    placeholder="8b5cf6"
                    className="w-full bg-transparent text-xs font-mono uppercase text-foreground outline-none"
                  />
                </div>
                <button
                  type="button"
                  title="Transparente / Sem cor"
                  onClick={() => {
                    onPick("transparent", false);
                    setOpen(false);
                  }}
                  className="rounded border border-border px-2 py-1 text-[11px] hover:bg-secondary"
                >
                  Nenhuma
                </button>
              </div>

              {/* Opacity slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Opacidade</span>
                  <span>{alpha}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alpha}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAlpha(val);
                    applySolid(currentHex, val);
                  }}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                />
              </div>

              {/* Document Palette */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Paleta do Documento
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {DOCUMENT_PALETTES.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      title={`${p.label} (${p.value})`}
                      onClick={() => applySolid(p.value)}
                      className={`group relative h-6 rounded border transition-transform hover:scale-110 ${
                        currentHex.toLowerCase() === p.value.toLowerCase()
                          ? "border-white ring-1 ring-primary"
                          : "border-border/60"
                      }`}
                      style={{ background: p.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Swatches Grid */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Cores Rápidas
                </p>
                <div className="grid grid-cols-8 gap-1 max-h-24 overflow-y-auto pr-1">
                  {SWATCH_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => applySolid(c)}
                      className="h-5 rounded border border-border/40 hover:border-white transition-transform hover:scale-105"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Gradient Preview */}
              <div
                className="h-10 w-full rounded-lg border border-border shadow-inner"
                style={{
                  background:
                    gradType === "linear"
                      ? `linear-gradient(${gradAngle}deg, ${gradFrom} 0%, ${gradTo} 100%)`
                      : `radial-gradient(circle, ${gradFrom} 0%, ${gradTo} 100%)`,
                }}
              />

              {/* Quick Gradient Presets */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Presets de Gradientes
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      title={g.label}
                      onClick={() => {
                        setGradFrom(g.from);
                        setGradTo(g.to);
                        applyGradient(gradType, gradAngle, g.from, g.to);
                      }}
                      className="h-6 rounded border border-border/60 transition-transform hover:scale-105"
                      style={{ background: g.style }}
                    />
                  ))}
                </div>
              </div>

              {/* Gradient Stops */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Cor Inicial</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={gradFrom}
                      onChange={(e) => {
                        setGradFrom(e.target.value);
                        applyGradient(gradType, gradAngle, e.target.value, gradTo);
                      }}
                      className="h-7 w-8 cursor-pointer rounded border border-border bg-background"
                    />
                    <input
                      type="text"
                      value={gradFrom}
                      onChange={(e) => setGradFrom(e.target.value)}
                      className="w-full rounded border border-input bg-background px-1.5 py-0.5 font-mono text-[10px]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Cor Final</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={gradTo}
                      onChange={(e) => {
                        setGradTo(e.target.value);
                        applyGradient(gradType, gradAngle, gradFrom, e.target.value);
                      }}
                      className="h-7 w-8 cursor-pointer rounded border border-border bg-background"
                    />
                    <input
                      type="text"
                      value={gradTo}
                      onChange={(e) => setGradTo(e.target.value)}
                      className="w-full rounded border border-input bg-background px-1.5 py-0.5 font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Type and Angle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGradType("linear");
                      applyGradient("linear", gradAngle, gradFrom, gradTo);
                    }}
                    className={`rounded px-2 py-1 text-[11px] font-medium ${
                      gradType === "linear"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border"
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradType("radial");
                      applyGradient("radial", gradAngle, gradFrom, gradTo);
                    }}
                    className={`rounded px-2 py-1 text-[11px] font-medium ${
                      gradType === "radial"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border"
                    }`}
                  >
                    Radial
                  </button>
                </div>
                {gradType === "linear" && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>{gradAngle}°</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={gradAngle}
                      onChange={(e) => {
                        const a = Number(e.target.value);
                        setGradAngle(a);
                        applyGradient(gradType, a, gradFrom, gradTo);
                      }}
                      className="w-20 cursor-pointer accent-primary"
                    />
                  </div>
                )}
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full text-xs font-bold uppercase tracking-wider"
                onClick={() => {
                  applyGradient();
                  setOpen(false);
                }}
              >
                Aplicar Gradiente
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
