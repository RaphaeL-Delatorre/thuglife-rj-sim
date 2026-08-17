import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, matchCase: boolean) => number;
  onNext: () => void;
  onPrev: () => void;
  onReplace: (query: string, replaceWith: string, matchCase: boolean) => boolean;
  onReplaceAll: (query: string, replaceWith: string, matchCase: boolean) => number;
}

export function SearchReplaceDialog({
  isOpen,
  onClose,
  onSearch,
  onNext,
  onPrev,
  onReplace,
  onReplaceAll,
}: SearchReplaceDialogProps) {
  const [query, setQuery] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const handleSearch = () => {
    if (!query) return;
    const count = onSearch(query, matchCase);
    setMatchCount(count);
  };

  const handleReplace = () => {
    if (!query) return;
    onReplace(query, replaceWith, matchCase);
    const count = onSearch(query, matchCase);
    setMatchCount(count);
  };

  const handleReplaceAll = () => {
    if (!query) return;
    const count = onReplaceAll(query, replaceWith, matchCase);
    setMatchCount(0);
    alert(`${count} ocorrência(s) substituída(s).`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-popover/95 backdrop-blur border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display uppercase tracking-wide">
            <span>🔍</span> Localizar e Substituir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Localizar
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setMatchCount(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Palavra ou frase..."
                className="h-9 text-sm"
              />
              <Button type="button" size="sm" onClick={handleSearch}>
                Buscar
              </Button>
            </div>
            {matchCount !== null && (
              <p className="text-[11px] text-primary font-medium">
                {matchCount > 0
                  ? `${matchCount} resultado(s) encontrado(s)`
                  : "Nenhum resultado encontrado"}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Substituir por
            </Label>
            <Input
              type="text"
              value={replaceWith}
              onChange={(e) => setReplaceWith(e.target.value)}
              placeholder="Novo texto..."
              className="h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="matchCase"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            <label htmlFor="matchCase" className="text-xs text-muted-foreground cursor-pointer">
              Diferenciar maiúsculas e minúsculas
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={!matchCount}
              >
                ← Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!matchCount}
              >
                Próximo →
              </Button>
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleReplace}
                disabled={!query}
              >
                Substituir
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleReplaceAll}
                disabled={!query}
              >
                Substituir Todos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
