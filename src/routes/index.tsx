import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logoAsset from "@/assets/logo-tl.png.asset.json";
import { SiteBackground } from "@/components/SiteBackground";
import { getSiteContent } from "@/lib/site.functions";
import type { SiteContent } from "@/lib/site.functions";

const logoImg = logoAsset.url;

export const Route = createFileRoute("/")({
  loader: () => getSiteContent(),
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
        content:
          "Entre na cidade mais viva do FiveM brasileiro. Mais de 10 anos de história no Rio.",
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
          description:
            "Servidor brasileiro de GTA RP (FiveM) com temática do Rio de Janeiro, no ar há mais de 10 anos.",
          foundingDate: "2015",
        }),
      },
    ],
  }),
});

const statsFallback = [
  { value: "10+", label: "Anos", sub: "no ar" },
  { value: "+100K", label: "Jogadores", sub: "registrados" },
  { value: "+60K", label: "Membros", sub: "no Discord" },
  { value: "+500", label: "Players", sub: "simultâneos" },
];

type NewsItem = {
  tag: string;
  title: string;
  text: string;
  mediaUrl?: string;
  mediaType?: string | null;
};

const newsFallback: NewsItem[] = [
  {
    tag: "Servidor",
    title: "Novo sistema de rachas noturnos na Zona Sul",
    text: "Circuitos fechados, apostas entre crews e recompensa por reputação. As pistas abrem toda sexta, 22h, com fiscalização policial dinâmica.",
  },
  {
    tag: "Atualização",
    title: "Aeromóvel policial e novo protocolo de operações",
    text: "As forças de segurança ganharam suporte aéreo, perseguição por rota e comunicação integrada entre batalhões dentro da cidade.",
  },
  {
    tag: "Evento",
    title: "Verão TLRJ: temporada de eventos na orla",
    text: "Quiosques jogáveis, campeonatos de futevôlei, shows ao vivo e empregos temporários exclusivos durante toda a temporada.",
  },
];

const requisitosFallback = [
  {
    n: "01",
    t: "Ter 16 anos ou mais",
    d: "Contas verificadas no Discord com idade mínima declarada.",
  },
  {
    n: "02",
    t: "GTA V Original + FiveM",
    d: "Cópia legítima na Steam, Epic ou Rockstar Launcher + FiveM instalado.",
  },
  {
    n: "03",
    t: "Microfone funcionando",
    d: "Todo o roleplay acontece por voz. Áudio limpo é obrigatório.",
  },
  {
    n: "04",
    t: "Ler as regras",
    d: "Whitelist só é liberada após a prova de regras dentro do Discord.",
  },
];

const DISCORD_URL = "https://discord.gg/thugliferj";
const CONNECT_URL = "fivem://connect/fivem.equipetl.com";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/thuglifefivem/",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .49 1.4.9.42.41.69.82.91 1.4.17.42.37 1.05.42 2.23.06 1.28.07 1.66.07 4.88s0 3.6-.07 4.88c-.05 1.18-.25 1.8-.42 2.23a3.7 3.7 0 0 1-.9 1.4c-.42.41-.83.68-1.41.9-.42.17-1.05.37-2.23.42-1.27.06-1.65.07-4.87.07s-3.6 0-4.88-.07c-1.18-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 0 0 1-.9-1.4c-.17-.42-.37-1.05-.42-2.23C2.2 15.6 2.2 15.22 2.2 12s0-3.6.07-4.88c.05-1.18.25-1.8.42-2.23.22-.58.49-.99.9-1.4.41-.41.82-.68 1.4-.9.43-.17 1.05-.37 2.23-.42C8.5 2.2 8.88 2.2 12 2.2Zm0 3.24a6.56 6.56 0 1 0 0 13.12 6.56 6.56 0 0 0 0-13.12Zm0 10.82a4.26 4.26 0 1 1 0-8.52 4.26 4.26 0 0 1 0 8.52Zm8.35-11.08a1.53 1.53 0 1 1-3.06 0 1.53 1.53 0 0 1 3.06 0Z",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@ThugLifeRJGames/videos",
    path: "M23 12s0-3.2-.4-4.74a2.5 2.5 0 0 0-1.76-1.77C19.28 5.1 12 5.1 12 5.1s-7.28 0-8.84.4A2.5 2.5 0 0 0 1.4 7.26C1 8.8 1 12 1 12s0 3.2.4 4.74a2.5 2.5 0 0 0 1.76 1.77c1.56.39 8.84.39 8.84.39s7.28 0 8.84-.4a2.5 2.5 0 0 0 1.76-1.76C23 15.2 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@thugliferjsd",
    path: "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-1.83-2.48v-3.2a5.72 5.72 0 1 0 4.93 5.67V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z",
  },
  {
    name: "Discord",
    href: DISCORD_URL,
    path: "M20.32 5.56A18 18 0 0 0 15.9 4.2l-.22.4a13.6 13.6 0 0 1 3.9 1.98 18.6 18.6 0 0 0-15.16 0A13.6 13.6 0 0 1 8.32 4.6l-.22-.4a18 18 0 0 0-4.42 1.36C.9 9.66.14 13.65.52 17.58a18.2 18.2 0 0 0 5.5 2.77l1.2-1.66c-.66-.25-1.29-.55-1.88-.9l.46-.35a13 13 0 0 0 11.12 0l.46.35c-.6.35-1.22.65-1.88.9l1.2 1.66c1.96-.6 3.83-1.54 5.5-2.77.45-4.56-.76-8.5-2.88-12.02ZM8.4 15.2c-1.06 0-1.94-.98-1.94-2.18s.85-2.19 1.94-2.19c1.1 0 1.97.99 1.95 2.19 0 1.2-.86 2.18-1.95 2.18Zm7.2 0c-1.07 0-1.94-.98-1.94-2.18s.85-2.19 1.94-2.19c1.1 0 1.96.99 1.94 2.19 0 1.2-.85 2.18-1.94 2.18Z",
  },
];

const faqFallback = [
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

function youtubeEmbed(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function NewsMedia({
  url,
  type,
  title,
}: {
  url: string;
  type?: string | null | undefined;
  title: string;
}) {
  if (!url) return null;
  const isVideo =
    type === "video" ||
    /\.(mp4|webm|ogg|mov|m4v)(?:\?|$)/i.test(url) ||
    /youtu\.be\/|youtube\.com\//i.test(url);
  if (!isVideo) {
    return (
      <img
        src={url}
        alt={title}
        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    );
  }

  const embedUrl = youtubeEmbed(url);
  return embedUrl ? (
    <div className="aspect-video bg-black">
      <iframe
        src={embedUrl}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  ) : (
    <video className="h-52 w-full bg-black object-cover" controls playsInline preload="metadata">
      <source src={url} />
      Seu navegador não suporta este vídeo.
    </video>
  );
}

function Index() {
  const [open, setOpen] = useState<number | null>(0);
  const content: SiteContent = Route.useLoaderData();
  const cfg = content.settings;

  const stats = content.stats.length
    ? content.stats.map((s) => ({ value: s.value, label: s.label, sub: s.sub ?? "" }))
    : statsFallback;
  const news: NewsItem[] = content.news.length
    ? content.news.map((n) => ({
        tag: n.tag ?? "",
        title: n.title,
        text: n.body ?? "",
        mediaUrl: n.media_url ?? "",
        mediaType: n.media_type,
      }))
    : newsFallback;
  const requisitos = content.requirements.length
    ? content.requirements.map((r) => ({ n: r.num, t: r.title, d: r.description ?? "" }))
    : requisitosFallback;
  const faq = content.faqs.length
    ? content.faqs.map((f) => ({ q: f.question, a: f.answer ?? "" }))
    : faqFallback;
  const discordUrl = cfg["discordUrl"] || DISCORD_URL;
  const connectUrl = cfg["connectUrl"] || CONNECT_URL;

  return (
    <div className="relative min-h-screen font-body text-foreground">
      {/* Background cinematográfico global */}
      <SiteBackground settings={cfg} />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#home" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo Thug Life RJ"
              width={44}
              height={44}
              className="h-11 w-11 rounded-md object-cover ring-1 ring-primary/50"
            />
            <span className="font-display text-lg tracking-wide">
              {cfg["siteName"] || "THUG LIFE RJ"}
            </span>
          </a>
          <ul className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-widest md:flex">
            <li>
              <a
                href="#home"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Início
              </a>
            </li>
            <li>
              <a
                href="#noticias"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Notícias
              </a>
            </li>
            <li>
              <a
                href="#jogar"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Jogar
              </a>
            </li>
            <li>
              <a
                href="#duvidas"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Dúvidas
              </a>
            </li>
            <li>
              <a
                href="https://loja.equipetl.com/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Loja
              </a>
            </li>
            <li>
              <Link
                to="/regras"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Regras
              </Link>
            </li>
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
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-background/50 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {cfg["heroBadge"] || "Mais de 10 anos no Ar · TL Reina"}
          </span>
          <h1 className="mt-7 max-w-4xl font-display text-[2.6rem] uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-[5rem]">
            <span className="block text-muted-foreground/80 text-[0.42em] tracking-[0.4em]">
              {cfg["heroKicker"] || "A cidade que não dorme"}
            </span>
            <span
              className="mt-3 block bg-clip-text text-transparent drop-shadow-[0_8px_30px_oklch(0.58_0.245_27/0.45)]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, oklch(1 0 0) 35%, oklch(0.78 0.02 20) 100%)",
              }}
            >
              {cfg["heroTitle"] || "A Thug Life RJ"}
            </span>
            <span className="mt-1 block text-[0.52em] font-normal tracking-wide text-foreground/90">
              escreve a História na temática{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-red)" }}
              >
                Baque RJ
              </span>{" "}
              há mais de <span className="text-stroke-red">10 anos</span>
            </span>
          </h1>
          <div className="mt-6 h-px w-40 bg-gradient-to-r from-primary to-transparent" />
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {cfg["heroDescription"] ||
              "Uma cidade viva do morro à orla: facções, corporações, negócios legais e ilegais, e uma comunidade que não para de crescer."}
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
        <h2 className="font-display text-4xl uppercase sm:text-5xl">
          {cfg["newsTitle"] || "Notícias da cidade"}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {cfg["newsSubtitle"] ||
            "Atualizações, eventos e bastidores do maior servidor com temática do Rio de Janeiro."}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {news.map((n) => (
            <article
              key={n.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/80 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/70 hover:shadow-[var(--shadow-glow)]"
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: "var(--gradient-red)" }}
              />
              {n.mediaUrl && <NewsMedia url={n.mediaUrl} type={n.mediaType} title={n.title} />}
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {n.tag}
                </span>
                <h3 className="mt-2 font-display text-xl uppercase leading-tight">{n.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{n.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="jogar"
        className="border-y border-border bg-surface-elevated py-24 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">
            {cfg["playTitle"] || "Jogue com a gente"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {cfg["playSubtitle"] || "Requisitos para liberar seu personagem e entrar na cidade."}
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {requisitos.map((r) => (
              <div
                key={r.n}
                className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur transition-colors hover:border-primary/60"
              >
                <span className="font-display text-3xl text-primary">{r.n}</span>
                <h3 className="mt-3 font-display text-lg uppercase">{r.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.d}</p>
                {r.n === "02" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href="https://store.steampowered.com/app/3240220/Grand_Theft_Auto_V_Enhanced/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-105"
                    >
                      Comprar GTA V
                    </a>
                    <a
                      href="https://fivem.net/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-primary/60 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-primary/15"
                    >
                      Baixar FiveM
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={connectUrl}
              className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-display text-xl uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
                <path d="M7 7h10a5 5 0 0 1 5 5v1a4 4 0 0 1-7.2 2.4L14 14h-4l-.8 1.4A4 4 0 0 1 2 13v-1a5 5 0 0 1 5-5Zm-1 3v1.5H4.5v1H6V14h1v-1.5h1.5v-1H7V10H6Zm10.5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
              </svg>
              Jogue Agora!
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl border border-primary/50 bg-card/85 p-6 shadow-[var(--shadow-glow)] backdrop-blur">
            <div className="flex-1">
              <h3 className="font-display text-2xl uppercase">Pronto pro corre?</h3>
              <p className="text-sm text-muted-foreground">
                Entre no Discord, faça a whitelist e comece sua história no Rio.
              </p>
            </div>
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-6 py-3 font-display text-lg uppercase text-primary-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              Entrar no Discord
            </a>
          </div>
        </div>
      </section>

      <section id="duvidas" className="mx-auto max-w-3xl px-5 py-24">
        <h2 className="font-display text-4xl uppercase sm:text-5xl">
          {cfg["faqTitle"] || "Dúvidas frequentes"}
        </h2>
        <div className="mt-8 space-y-3">
          {faq.map((f, i) => (
            <div
              key={f.q}
              className="overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur transition-colors hover:border-primary/60"
            >
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
          <img
            src={logoImg}
            alt="Logo Thug Life RJ"
            loading="lazy"
            width={72}
            height={72}
            className="h-18 w-18 rounded-lg object-cover ring-1 ring-primary/40"
          />
          <p className="font-display text-lg uppercase tracking-wide">Thug Life RJ</p>
          <ul className="flex items-center gap-5">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="block text-muted-foreground transition-colors hover:text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Thug Life RJ. Servidor de roleplay não afiliado à Rockstar
            Games ou Take-Two.
          </p>
        </div>
      </footer>
    </div>
  );
}
