import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";

import logoAsset from "@/assets/logo-tl.png.asset.json";
import { RichContent } from "@/components/editor/RichContent";
import { getRuleCategory } from "@/lib/site.functions";
import type { RuleCategoryPage } from "@/lib/site.functions";

const logoImg = logoAsset.url;

export const Route = createFileRoute("/regras/$slug")({
  loader: async ({ params }) => {
    const data = await getRuleCategory({ data: { slug: params.slug } });
    if (!data.category) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const cat = loaderData?.category;
    const title = cat ? `${cat.name} — Regras` : "Categoria de regras";
    const description =
      (cat?.subtitle || cat?.description || "Regras oficiais do servidor.").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Fallback title="Erro ao carregar a categoria" />,
  notFoundComponent: () => <Fallback title="Categoria não encontrada" />,
  component: CategoriaPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen font-body text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo do servidor"
              width={44}
              height={44}
              className="h-11 w-11 rounded-md object-cover ring-1 ring-primary/50"
            />
            <span className="font-display text-lg tracking-wide">THUG LIFE RJ</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/regras"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              Regras
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              Início
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 pt-28 pb-24">{children}</main>
    </div>
  );
}

function Fallback({ title }: { title: string }) {
  return (
    <Shell>
      <h1 className="font-display text-3xl uppercase">{title}</h1>
      <Link to="/regras" className="mt-4 inline-block text-sm font-semibold uppercase text-primary">
        ← Voltar para as regras
      </Link>
    </Shell>
  );
}

function normalize(v: string) {
  return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function Secao({
  title,
  icon,
  bodyHtml,
  itens,
  busca,
  defaultOpen,
}: {
  title: string;
  icon: string;
  bodyHtml: string;
  itens: { id: string; code: string; text: string; html: string }[];
  busca: string;
  defaultOpen: boolean;
}) {
  const [aberto, setAberto] = useState(defaultOpen);
  const q = normalize(busca);
  const filtrados = q
    ? itens.filter((i) => normalize(`${i.code} ${i.text} ${i.html}`).includes(q))
    : itens;
  const matchTitulo = q ? normalize(title + bodyHtml).includes(q) : true;
  if (q && filtrados.length === 0 && !matchTitulo) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-md">
      <button
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <h2 className="font-display text-xl uppercase tracking-wide">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        <span className="text-sm text-primary">{aberto ? "▼" : "▶"}</span>
      </button>
      {aberto && (
        <div className="border-t border-border px-6 py-5">
          <RichContent html={bodyHtml} />
          {filtrados.length > 0 && (
            <ul className="mt-4 space-y-3">
              {filtrados.map((i) => (
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
      )}
    </section>
  );
}

function CategoriaPage() {
  const { category, sections, rules }: RuleCategoryPage = Route.useLoaderData();
  const [busca, setBusca] = useState("");
  if (!category) return <Fallback title="Categoria não encontrada" />;

  return (
    <Shell>
      <Link to="/regras" className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
        ← Regras
      </Link>

      <h1 className="mt-4 font-display text-4xl uppercase sm:text-5xl">
        {category.icon && <span className="mr-3">{category.icon}</span>}
        {category.name}
      </h1>
      {category.subtitle && (
        <p className="mt-2 font-semibold text-foreground">{category.subtitle}</p>
      )}
      {category.description && <p className="mt-2 text-muted-foreground">{category.description}</p>}

      {sections.length > 0 && (
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
      )}

      {category.content_html && (
        <article className="mt-8 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-md">
          <RichContent html={category.content_html} />
        </article>
      )}

      <div className="mt-8 space-y-4">
        {sections.map((s, index) => (
          <Secao
            key={s.id}
            title={s.title}
            icon={s.icon}
            bodyHtml={s.body_html}
            defaultOpen={index === 0}
            busca={busca}
            itens={rules
              .filter((r) => r.section_id === s.id)
              .sort((a, b) => a.sort_order - b.sort_order)}
          />
        ))}
      </div>
    </Shell>
  );
}
