import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EMOJI_CATEGORIES, SPECIAL_CHARACTERS_CATEGORIES } from "./editor-constants";
import { Input } from "@/components/ui/input";

interface EmojiSpecialPickerProps {
  onInsert: (char: string) => void;
  children?: React.ReactNode;
}

export function EmojiSpecialPicker({ onInsert, children }: EmojiSpecialPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"emoji" | "symbols">("emoji");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredEmojis = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list: string[] = [];

    if (activeCategory === "all") {
      list = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    } else {
      const found = EMOJI_CATEGORIES.find((c) => c.name === activeCategory);
      list = found ? found.emojis : [];
    }

    // Deduplicate
    const unique = Array.from(new Set(list));
    if (!q) return unique;

    // Filter categories that match search term
    const matchedCategories = EMOJI_CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(q)
    ).flatMap((c) => c.emojis);

    if (matchedCategories.length > 0) {
      return Array.from(new Set([...matchedCategories, ...unique]));
    }
    return unique;
  }, [search, activeCategory]);

  const filteredSymbols = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list: string[] = [];

    if (activeCategory === "all") {
      list = SPECIAL_CHARACTERS_CATEGORIES.flatMap((c) => c.chars);
    } else {
      const found = SPECIAL_CHARACTERS_CATEGORIES.find((c) => c.name === activeCategory);
      list = found ? found.chars : [];
    }

    const unique = Array.from(new Set(list));
    if (!q) return unique;

    const matchedCats = SPECIAL_CHARACTERS_CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(q)
    ).flatMap((c) => c.chars);

    if (matchedCats.length > 0) {
      return Array.from(new Set([...matchedCats, ...unique]));
    }
    return unique;
  }, [search, activeCategory]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            title="Emojis e Caracteres Especiais"
            className="flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
          >
            😀✦
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-3 bg-popover/95 backdrop-blur border border-border shadow-2xl z-50"
      >
        <div className="space-y-3">
          {/* Header tabs */}
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex rounded-md bg-secondary/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab("emoji");
                  setActiveCategory("all");
                }}
                className={`rounded px-3 py-1 font-semibold transition-colors ${
                  tab === "emoji"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                😀 Emojis
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("symbols");
                  setActiveCategory("all");
                }}
                className={`rounded px-3 py-1 font-semibold transition-colors ${
                  tab === "symbols"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ✦ Símbolos / Caracteres
              </button>
            </div>
          </div>

          {/* Search box */}
          <div>
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "emoji"
                  ? "Pesquisar (ex: polícia, alerta, dinheiro)..."
                  : "Pesquisar (ex: setas, marcas, estrelas)..."
              }
              className="h-8 text-xs bg-background"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap transition-colors ${
                activeCategory === "all"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {tab === "emoji"
              ? EMOJI_CATEGORIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setActiveCategory(c.name)}
                    className={`rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
                      activeCategory === c.name
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </button>
                ))
              : SPECIAL_CHARACTERS_CATEGORIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setActiveCategory(c.name)}
                    className={`rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap transition-colors ${
                      activeCategory === c.name
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
          </div>

          {/* Grid of characters */}
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1 bg-background/50 rounded-lg border border-border/50">
            {tab === "emoji" ? (
              filteredEmojis.length > 0 ? (
                filteredEmojis.map((e, idx) => (
                  <button
                    key={`${e}-${idx}`}
                    type="button"
                    title={e}
                    onClick={() => {
                      onInsert(e);
                      setOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-primary/20 hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))
              ) : (
                <div className="col-span-8 py-4 text-center text-xs text-muted-foreground">
                  Nenhum emoji encontrado.
                </div>
              )
            ) : filteredSymbols.length > 0 ? (
              filteredSymbols.map((s, idx) => (
                <button
                  key={`${s}-${idx}`}
                  type="button"
                  title={s}
                  onClick={() => {
                    onInsert(s);
                    setOpen(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded font-mono text-base hover:bg-primary/20 hover:scale-125 transition-transform"
                >
                  {s}
                </button>
              ))
            ) : (
              <div className="col-span-8 py-4 text-center text-xs text-muted-foreground">
                Nenhum símbolo encontrado.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
