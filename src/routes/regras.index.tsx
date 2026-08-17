import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import logoAsset from "@/assets/logo-tl.png.asset.json";
import { RichContent } from "@/components/editor/RichContent";
import { getSiteContent } from "@/lib/site.functions";
import type { SiteContent } from "@/lib/site.functions";

const logoImg = logoAsset.url;

export const Route = createFileRoute("/regras/")({
  loader: () => getSiteContent(),
  component: RegrasPage,
  head: () => ({
    meta: [
      { title: "Regras e Termos — Thug Life RJ" },
      {
        name: "description",
        content:
          "Termos de uso, categorias de regras e ações disponíveis no servidor Thug Life RJ (FiveM). Leia antes de conectar na cidade.",
      },
      { property: "og:title", content: "Regras e Termos — Thug Life RJ" },
      {
        property: "og:description",
        content: "Tudo que você precisa saber para jogar dentro das regras na Thug Life RJ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Menu({
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon?: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-background/50">
      <button
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-primary/5"
      >
        <span className="font-display text-base uppercase tracking-wide sm:text-lg">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </span>
        <span className={`text-primary transition-transform ${aberto ? "rotate-90" : ""}`}>▶</span>
      </button>
      {aberto && <div className="border-t border-border/70 px-5 py-5">{children}</div>}
    </section>
  );
}

function RegrasPage() {
  const content: SiteContent = Route.useLoaderData();
  const cfg = content.settings;
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();
  const match = (...parts: (string | null | undefined)[]) =>
    !termo || parts.some((p) => (p ?? "").toLowerCase().includes(termo));

  const termos = content.sections
    .filter((s) => !s.category_id && s.block === "termos")
    .sort((a, b) => a.sort_order - b.sort_order);

  const categorias = content.categories.filter((c) => match(c.name, c.subtitle, c.description));


  const portes: string[] = [];
  for (const a of content.actions) {
    const p = a.porte ?? "";
    if (!portes.includes(p)) portes.push(p);
  }

  return (
    <div className="relative min-h-screen font-body text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo Thug Life RJ"
              width={44}
              height={44}
              className="h-11 w-11 rounded-md object-cover ring-1 ring-primary/50"
            />
            <span className="font-display text-lg tracking-wide">{cfg["siteName"] || "THUG LIFE RJ"}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              Início
            </Link>
            <a
              href={cfg["connectUrl"] || "fivem://connect/fivem.equipetl.com"}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-105"
            >
              Conectar
            </a>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-28 pb-24">
        <div className="flex justify-center">
          <img
            src={logoImg}
            alt={`Logo ${cfg["siteName"] || "Thug Life RJ"}`}
            width={160}
            height={160}
            className="h-32 w-32 rounded-xl object-cover ring-2 ring-primary/50 sm:h-40 sm:w-40"
          />
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card/80 p-5 backdrop-blur-md">
          <label htmlFor="busca" className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            🔍 Pesquisar nesta categoria
          </label>
          <input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite uma palavra ou termo..."
            className="mt-3 w-full rounded-md border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        {cfg["rulesTopHtml"] && <RichContent html={cfg["rulesTopHtml"]} className="mt-8" />}

        <div className="mt-8 space-y-8 rounded-2xl border border-border bg-card/70 p-6 shadow-[var(--shadow-glow)] backdrop-blur-md sm:p-8">
          <Menu title={cfg["termsTitle"] || "Termos e Condições de Uso"} icon="📘" defaultOpen={busca.length > 0}>
            {termos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Conteúdo em atualização.</p>
            ) : (
              <div className="space-y-6">

                {termos.map((s) => {
                  const itens = content.rules
                    .filter((r) => r.section_id === s.id)
                    .sort((a, b) => a.sort_order - b.sort_order);
                  return (
                    <div key={s.id}>
                      <h3 className="font-display text-base uppercase tracking-wide text-primary">
                        {s.icon && <span className="mr-2">{s.icon}</span>}
                        {s.title}
                      </h3>
                      <RichContent html={s.body_html} className="mt-2" />
                      {itens.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {itens.map((i) => (
                            <li key={i.id} className="text-sm leading-relaxed text-muted-foreground">
                              {i.html?.trim() ? (
                                <RichContent html={i.html} />
                              ) : (
                                <>
                                  {i.code && <strong className="mr-2 font-bold text-primary">{i.code}</strong>}
                                  {i.text}
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Menu>

          <section className="rounded-xl border border-border/70 bg-background/50 p-5">
            <h2 className="font-display text-lg uppercase tracking-wide">📚 Categorias de Regras</h2>
            <div className="mt-2 h-px w-full bg-primary/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              As regras completas do servidor estão organizadas nas seguintes categorias. Clique em cada uma
              para mais detalhes:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categorias.map((c) => (
                <Link
                  key={c.slug}
                  to="/regras/$slug"
                  params={{ slug: c.slug }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  {c.icon && <span aria-hidden>{c.icon}</span>}
                  {c.name}
                </Link>
              ))}
              {categorias.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma categoria publicada.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-background/50 p-5">
            <h2 className="font-display text-lg uppercase tracking-wide">🎯 Ações Disponíveis no Servidor</h2>
            <div className="mt-2 h-px w-full bg-primary/60" />

            <div className="mt-4 space-y-6">
              {portes.map((porte) => (
                <div key={porte} className="space-y-3">
                  {porte && (
                    <h3 className="text-sm font-bold uppercase tracking-wide text-primary">{porte}</h3>
                  )}
                  {content.actions
                    .filter((a) => (a.porte ?? "") === porte)
                    .map((a) => (
                      <Menu key={a.id} title={a.nome} icon={a.icon ?? ""}>
                        {a.html?.trim() ? (
                          <RichContent html={a.html} />
                        ) : (
                          <>
                            <p className="text-sm font-semibold">
                              Bandidos: {a.bandidos} · Polícia: {a.policia}
                            </p>
                            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                              {((a.regras ?? []) as string[]).map((r) => (
                                <li key={r}>• {r}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </Menu>
                    ))}
                </div>
              ))}
              {content.actions.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma ação cadastrada.</p>
              )}
            </div>
          </section>

          {cfg["rulesBottomHtml"] && <RichContent html={cfg["rulesBottomHtml"]} />}
        </div>
      </main>
    </div>
  );
}
