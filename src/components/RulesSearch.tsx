import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { buildSearchIndex, excerpt, searchHits } from "@/lib/rules-search";
import type { SiteContent } from "@/lib/site.functions";

export function RulesSearch({ content }: { content: SiteContent }) {
  const [term, setTerm] = useState("");
  const index = useMemo(() => buildSearchIndex(content), [content]);
  const results = useMemo(() => searchHits(index, term), [index, term]);
  const ativo = term.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-md sm:p-6">
      <div className="flex items-center gap-2 border-b border-primary/70 pb-3">
        <span aria-hidden>🔍</span>
        <h2 className="font-display text-base uppercase tracking-wide sm:text-lg">
          Pesquisar nas regras e no Código Penal
        </h2>
      </div>

      <div className="relative mt-4">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Digite uma palavra ou termo..."
          aria-label="Pesquisar nas regras"
          className="w-full rounded-lg border border-primary/70 bg-background/70 px-4 py-3 pr-20 text-sm outline-none transition-colors focus:border-primary"
        />
        {ativo && (
          <button
            type="button"
            onClick={() => setTerm("")}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground/80 hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {ativo && (
        <>
          <p className="mt-3 text-xs text-muted-foreground">
            {results.length} resultado{results.length === 1 ? "" : "s"} em todo o site de regras.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-primary/50">
            <div className="bg-primary/15 px-4 py-3 text-sm font-bold text-primary">
              {results.length} resultado{results.length === 1 ? "" : "s"}
            </div>
            <div className="max-h-[26rem] space-y-2 overflow-y-auto bg-background/60 p-3">
              {results.length === 0 && (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Nada encontrado para “{term}”.
                </p>
              )}
              {results.map((hit, i) => {
                const inner = (
                  <>
                    <p className="text-sm font-bold text-primary">{hit.group}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="mr-1" aria-hidden>
                        {hit.icon}
                      </span>
                      {hit.section}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                      {excerpt(hit.snippet, term)}
                    </p>
                  </>
                );
                const cls = `block w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  i === 0
                    ? "border-primary/60 bg-primary/10 hover:bg-primary/15"
                    : "border-border bg-card/70 hover:bg-secondary/60"
                }`;
                return hit.slug ? (
                  <Link
                    key={hit.id}
                    to="/regras/$slug"
                    params={{ slug: hit.slug }}
                    search={{ q: term }}
                    className={cls}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={hit.id} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
