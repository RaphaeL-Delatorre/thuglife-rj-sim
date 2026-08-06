import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroAsset from "@/assets/tl.png.asset.json";
import news1Asset from "@/assets/tl-2.png.asset.json";
import news2Asset from "@/assets/tl-3.png.asset.json";
import news3Asset from "@/assets/tl-4.png.asset.json";
import logoAsset from "@/assets/logo-tl.png.asset.json";

const logoImg = logoAsset.url;
const news1 = news1Asset.url;
const news2 = news2Asset.url;
const news3 = news3Asset.url;

const bgSlides = [heroAsset.url, news1Asset.url, news2Asset.url, news3Asset.url];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Thug Life RJ — GTA RP do Rio há mais de 10 anos" },
      {
        name: "description",
        content:
          "Thug Life RJ: o servidor de FiveM com a cara do Rio de Janeiro. Mais de 10 anos no ar, comunidade gigante e roleplay sério.",
      },
      { property: "og:title", content: "Thug Life RJ — GTA RP do Rio há mais de 10 anos" },
      {
        property: "og:description",
        content: "Entre na cidade mais viva do FiveM brasileiro. Mais de 10 anos de história no Rio.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Thug Life RJ",
          description: "Servidor brasileiro de GTA RP (FiveM) com temática do Rio de Janeiro, no ar há mais de 10 anos.",
          foundingDate: "2015",
        }),
      },
    ],
  }),
});

const stats = [
  { value: "10+", label: "Anos", sub: "no ar" },
  { value: "+100K", label: "Jogadores", sub: "registrados" },
  { value: "+60K", label: "Membros", sub: "no Discord" },
  { value: "+500", label: "Players", sub: "simultâneos" },
];

const news = [
  {
    img: news1,
    tag: "Servidor",
    title: "Novo sistema de rachas noturnos na Zona Sul",
    text: "Circuitos fechados, apostas entre crews e recompensa por reputação. As pistas abrem toda sexta, 22h, com fiscalização policial dinâmica.",
  },
  {
    img: news2,
    tag: "Atualização",
    title: "Aeromóvel policial e novo protocolo de operações",
    text: "As forças de segurança ganharam suporte aéreo, perseguição por rota e comunicação integrada entre batalhões dentro da cidade.",
  },
  {
    img: news3,
    tag: "Evento",
    title: "Verão TLRJ: temporada de eventos na orla",
    text: "Quiosques jogáveis, campeonatos de futevôlei, shows ao vivo e empregos temporários exclusivos durante toda a temporada.",
  },
];

const requisitos = [
  { n: "01", t: "Ter 16 anos ou mais", d: "Contas verificadas no Discord com idade mínima declarada." },
  { n: "02", t: "GTA V original", d: "Cópia legítima na Steam, Epic ou Rockstar Launcher + FiveM instalado." },
  { n: "03", t: "Microfone funcionando", d: "Todo o roleplay acontece por voz. Áudio limpo é obrigatório." },
  { n: "04", t: "Ler as regras", d: "Whitelist só é liberada após a prova de regras dentro do Discord." },
];

const faq = [
  {
    q: "Como entro no servidor?",
    a: "Entre no nosso Discord, abra o canal de whitelist, faça a prova de regras e aguarde a liberação do personagem. O processo costuma levar poucas horas.",
  },
  {
    q: "O servidor é pago?",
    a: "Não. O acesso é gratuito. A loja existe apenas para itens cosméticos e apoio ao servidor, sem vantagens que quebrem o roleplay.",
  },
  {
    q: "Preciso de um PC forte?",
    a: "Se o seu PC roda GTA V, ele roda o Thug Life RJ. Recomendamos 16GB de RAM e SSD para carregamento mais rápido dos mapas customizados.",
  },
  {
    q: "Posso jogar como policial ou médico?",
    a: "Sim. As corporações abrem vagas periodicamente e o recrutamento é anunciado no Discord, com treinamento interno dentro da cidade.",
  },
];

function Index() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#home" className="flex items-center gap-3">
            <img src={logoImg} alt="Logo Thug Life RJ" width={44} height={44} className="h-11 w-11" />
            <span className="font-display text-lg tracking-wide">THUG LIFE RJ</span>
          </a>
          <ul className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-widest md:flex">
            <li><a href="#home" className="text-muted-foreground transition-colors hover:text-primary">Início</a></li>
            <li><a href="#noticias" className="text-muted-foreground transition-colors hover:text-primary">Notícias</a></li>
            <li><a href="#jogar" className="text-muted-foreground transition-colors hover:text-primary">Jogar</a></li>
            <li><a href="#duvidas" className="text-muted-foreground transition-colors hover:text-primary">Dúvidas</a></li>
          </ul>
          <a
            href="#jogar"
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-105"
          >
            Conectar
          </a>
        </nav>
      </header>

      <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Vista noturna do Rio de Janeiro no servidor Thug Life RJ"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20">
          <span className="inline-block rounded-full border border-primary/50 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Mais de 10 anos no Ar · TL Reina
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] uppercase sm:text-6xl lg:text-7xl">
            A <span className="text-primary">Thug Life RJ</span> escreve a História na temática{" "}
            <span className="text-primary">Baque RJ</span> há mais de <span className="text-primary">10 anos</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Uma cidade viva do morro à orla: facções, corporações, negócios legais e ilegais, e uma comunidade
            que não para de crescer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#jogar"
              className="rounded-md px-6 py-3 font-display text-lg uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
              style={{ background: "var(--gradient-gold)" }}
            >
              Começar a jogar
            </a>
            <a
              href="#noticias"
              className="rounded-md border border-border bg-card/70 px-6 py-3 font-display text-lg uppercase tracking-wide transition-colors hover:border-primary"
            >
              Ver novidades
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-card/70 p-5 shadow-[var(--shadow-card)] backdrop-blur"
              >
                <dt className="font-display text-4xl text-primary">{s.value}</dt>
                <dd className="mt-1 text-sm font-semibold uppercase tracking-wider">{s.label}</dd>
                <dd className="text-xs uppercase tracking-wider text-muted-foreground">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="noticias" className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="font-display text-4xl uppercase sm:text-5xl">Notícias da cidade</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Atualizações, eventos e bastidores do maior servidor com temática do Rio de Janeiro.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {news.map((n) => (
            <article
              key={n.title}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-colors hover:border-primary/60"
            >
              <img
                src={n.img}
                alt={n.title}
                loading="lazy"
                width={1280}
                height={800}
                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{n.tag}</span>
                <h3 className="mt-2 font-display text-xl uppercase leading-tight">{n.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{n.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="jogar" className="border-y border-border bg-surface-elevated py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">Jogue com a gente</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Requisitos para liberar seu personagem e entrar na cidade.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {requisitos.map((r) => (
              <div key={r.n} className="rounded-xl border border-border bg-card p-6">
                <span className="font-display text-3xl text-primary">{r.n}</span>
                <h3 className="mt-3 font-display text-lg uppercase">{r.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl border border-primary/40 bg-card p-6">
            <div className="flex-1">
              <h3 className="font-display text-2xl uppercase">Pronto pro corre?</h3>
              <p className="text-sm text-muted-foreground">
                Entre no Discord, faça a whitelist e comece sua história no Rio.
              </p>
            </div>
            <a
              href="#duvidas"
              className="rounded-md px-6 py-3 font-display text-lg uppercase text-primary-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              Entrar no Discord
            </a>
          </div>
        </div>
      </section>

      <section id="duvidas" className="mx-auto max-w-3xl px-5 py-24">
        <h2 className="font-display text-4xl uppercase sm:text-5xl">Dúvidas frequentes</h2>
        <div className="mt-8 space-y-3">
          {faq.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-lg border border-border bg-card">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                aria-expanded={open === i}
              >
                {f.q}
                <span className="font-display text-xl text-primary">{open === i ? "–" : "+"}</span>
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center">
          <img src={logoImg} alt="Logo Thug Life RJ" loading="lazy" width={48} height={48} className="h-12 w-12" />
          <p className="font-display text-lg uppercase tracking-wide">Thug Life RJ</p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Thug Life RJ. Servidor de roleplay não afiliado à Rockstar Games ou Take-Two.
          </p>
        </div>
      </footer>
    </div>
  );
}
