import { useEffect, useState } from "react";
import { SLASH_COMMANDS } from "./editor-constants";

interface QuickSlashMenuProps {
  isOpen: boolean;
  filterText: string;
  position: { top: number; left: number };
  onSelect: (commandKey: string) => void;
  onClose: () => void;
}

export function QuickSlashMenu({
  isOpen,
  filterText,
  position,
  onSelect,
  onClose,
}: QuickSlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cleanFilter = filterText.toLowerCase().replace("/", "");
  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.key.toLowerCase().includes(cleanFilter) ||
      cmd.label.toLowerCase().includes(cleanFilter) ||
      cmd.desc.toLowerCase().includes(cleanFilter)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanFilter]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        onSelect(filtered[selectedIndex]?.key ?? filtered[0]?.key ?? "");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        top: Math.min(position.top, window.innerHeight - 340),
        left: Math.min(position.left, window.innerWidth - 300),
      }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 flex items-center justify-between">
        <span>Comandos Rápidos</span>
        <span className="font-mono text-[9px] bg-secondary px-1.5 py-0.5 rounded">↑↓ navegar · Enter</span>
      </div>

      <div className="mt-1 space-y-0.5">
        {filtered.length > 0 ? (
          filtered.map((cmd, idx) => (
            <button
              key={cmd.key}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(cmd.key);
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                idx === selectedIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/40 text-base shadow-sm">
                {cmd.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate">{cmd.label}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      idx === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    /{cmd.key}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate ${
                    idx === selectedIndex ? "text-primary-foreground/90" : "text-muted-foreground"
                  }`}
                >
                  {cmd.desc}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Nenhum comando encontrado para &ldquo;{cleanFilter}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
