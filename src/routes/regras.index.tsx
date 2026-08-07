import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import logoAsset from "@/assets/logo-tl.png.asset.json";
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
          "Termos de uso, regras gerais, ações e categorias de regras do servidor Thug Life RJ (FiveM). Leia antes de conectar na cidade.",
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

type Secao = { id: string; titulo: string; itens: { n: string; texto: string }[] };

const termosFallback: Secao[] = [
  {
    id: "acesso",
    titulo: "1. Acesso à Cidade",
    itens: [
      { n: "1.1", texto: "A Thug Life RJ é um projeto de entretenimento virtual hospedado em servidores contratados pela administração." },
      { n: "1.2", texto: "O acesso acontece exclusivamente pela plataforma FiveM. Ao conectar, o jogador também aceita os termos da Cfx.re; instabilidades da plataforma fogem ao nosso controle." },
      { n: "1.3", texto: "Seguimos a classificação indicativa do GTA V (18 anos). Se um menor conectar na cidade, a supervisão é responsabilidade integral dos pais ou responsáveis legais." },
      { n: "1.4", texto: "A liberação do personagem depende da whitelist concluída no Discord oficial." },
    ],
  },
  {
    id: "participacao",
    titulo: "2. Regras de Participação",
    itens: [
      { n: "2.1", texto: "O jogador se compromete a respeitar as regras gerais e específicas de roleplay do servidor." },
      { n: "2.2", texto: "Conhecer as regras não substitui bom senso e postura respeitosa com os demais jogadores e com a equipe." },
      { n: "2.3", texto: "As regras são atualizadas periodicamente. O desconhecimento não é aceito como justificativa." },
      { n: "2.4", texto: "Ao conectar, o jogador aceita os sistemas de monitoramento, gravação e análise usados na segurança da cidade." },
      { n: "2.5", texto: "Em caso de dúvida, procure a equipe antes de tomar qualquer atitude que possa quebrar uma norma." },
      { n: "2.6", texto: "Ocorrências graves ou durante eventos oficiais são avaliadas com critério redobrado." },
    ],
  },
  {
    id: "discord",
    titulo: "3. Discord Oficial",
    itens: [
      { n: "3.1", texto: "A permanência na cidade está vinculada à presença no Discord oficial da Thug Life RJ. Sair ou ser removido do Discord pode implicar perda de acesso e novo processo de entrada." },
      { n: "3.2", texto: "Nome no Discord e nome do personagem devem permitir a identificação do jogador pela equipe." },
    ],
  },
  {
    id: "economia",
    titulo: "4. Itens e Economia",
    itens: [
      { n: "4.1", texto: "Todos os itens e recursos existem apenas dentro da cidade e pertencem à estrutura virtual do projeto." },
      { n: "4.2", texto: "É proibido vender, comprar ou trocar itens do jogo por dinheiro real ou em plataformas externas. Penalidade: banimento permanente." },
      { n: "4.3", texto: "Negociações entre jogadores devem respeitar o contexto de roleplay; a equipe pode intervir em casos de favorecimento ou abuso." },
      { n: "4.4", texto: "Duplicação, alteração ou manipulação ilícita de itens é infração grave com punição imediata." },
      { n: "4.5", texto: "A administração pode inspecionar inventários, logs e transações a qualquer momento." },
      { n: "4.6", texto: "É proibido usar bots, macros, scripts ou qualquer automação para obter vantagem." },
    ],
  },
  {
    id: "wipe",
    titulo: "5. Wipe e Temporadas",
    itens: [
      { n: "5.1", texto: "O servidor opera em temporadas. A cada nova season pode haver wipe, com redefinição de bens e recursos para equilibrar a economia." },
      { n: "5.2", texto: "O wipe não apaga histórico de comportamento nem anula punições anteriores." },
    ],
  },
  {
    id: "atualizacoes",
    titulo: "6. Atualizações e Revisões",
    itens: [
      { n: "6.1", texto: "Este documento pode ser atualizado a qualquer momento, com ou sem aviso prévio. Confira antes de conectar." },
    ],
  },
];

const geraisFallback: Secao[] = [
  {
    id: "conduta",
    titulo: "Conduta e Roleplay",
    itens: [
      { n: "G1", texto: "Powergaming: forçar situações irreais ou impor ações ao personagem alheio é proibido." },
      { n: "G2", texto: "Metagaming: usar informação de fora do jogo (Discord, live, chamada) dentro do RP é proibido." },
      { n: "G3", texto: "Vida Douta (VDM) e atropelamento sem contexto resultam em punição." },
      { n: "G4", texto: "Combat Logging: deslogar durante uma ação, perseguição ou abordagem é infração grave." },
      { n: "G5", texto: "Valorize a vida do seu personagem. Sob ameaça armada real, obedeça." },
      { n: "G6", texto: "Revenge Kill: voltar ao local de uma ação para se vingar é proibido." },
      { n: "G7", texto: "Ofensas reais, racismo, homofobia e qualquer tipo de discriminação levam a banimento permanente, dentro ou fora do RP." },
      { n: "G8", texto: "Qualquer software externo, cheat, mod menu ou exploit resulta em banimento permanente do CFX." },
    ],
  },
  {
    id: "policia",
    titulo: "Regras Policiais",
    itens: [
      { n: "P1", texto: "Policiais devem seguir o protocolo de abordagem e negociação, nunca chegando atirando sem contexto." },
      { n: "P2", texto: "Uso de armamento pesado só é liberado conforme o porte da ação em andamento." },
      { n: "P3", texto: "Corrupção policial só é permitida com autorização e contexto aprovado pela corporação." },
      { n: "P4", texto: "É proibido usar recursos da corporação (viaturas, armas, sistemas) para fins pessoais." },
    ],
  },
  {
    id: "ilegal",
    titulo: "Regras do Ilegal",
    itens: [
      { n: "I1", texto: "Toda ação precisa de contexto e roleplay antes do confronto armado." },
      { n: "I2", texto: "Reféns só podem ser feitos nas ações que permitem; sempre com negociação." },
      { n: "I3", texto: "É proibido roubar jogadores em áreas safe ou recém-chegados na cidade." },
      { n: "I4", texto: "Limites de integrantes por ação devem ser respeitados conforme a tabela de ações." },
    ],
  },
  {
    id: "hospital",
    titulo: "Hospital e Áreas Safe",
    itens: [
      { n: "H1", texto: "Hospitais, delegacias, spawns e prefeitura são áreas safe: proibido qualquer ação hostil." },
      { n: "H2", texto: "Após ser resgatado, o personagem não lembra dos detalhes do que causou sua morte." },
      { n: "H3", texto: "É proibido perseguir ou finalizar jogadores em atendimento médico." },
    ],
  },
];

const acoesFallback = [
  { porte: "Pequeno Porte", nome: "Lojinhas", bandidos: 3, policia: 4, regras: ["Apenas pistola", "Negociação obrigatória", "Sem reféns", "1 bandido pode ficar do lado de fora"] },
  { porte: "Pequeno Porte", nome: "Ammunation", bandidos: 2, policia: 3, regras: ["Apenas pistola", "Negociação obrigatória", "Sem reféns", "Proibido bandido fora do estabelecimento"] },
  { porte: "Médio Porte", nome: "Central de Dados", bandidos: 4, policia: 6, regras: ["Fuzil liberado", "Negociação obrigatória", "1 refém permitido"] },
  { porte: "Médio Porte", nome: "Joalheria", bandidos: 4, policia: 6, regras: ["Fuzil liberado", "Negociação obrigatória", "Rota de fuga definida no RP"] },
  { porte: "Grande Porte", nome: "Banco Central", bandidos: 6, policia: 10, regras: ["Armamento pesado liberado", "Negociação obrigatória", "Até 2 reféns", "Ação única por dia"] },
  { porte: "Grande Porte", nome: "Carro Forte", bandidos: 5, policia: 8, regras: ["Fuzil liberado", "Sem reféns", "Perseguição encerra a ação"] },
];

const categoriasFallback = [
  "Termos de Compras",
  "Regras Gerais",
  "Código Penal",
  "Áreas Safes",
  "Regras Policiais",
  "Regras do Ilegal",
  "Regras do Hospital",
  "Regras de Denúncias",
  "Regras de Telagem",
  "Regras de Ações",
];

function normalize(v: string) {
  return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function Bloco({ secao, busca }: { secao: Secao; busca: string }) {
  const [aberto, setAberto] = useState(true);
  const q = normalize(busca);
  const itens = q ? secao.itens.filter((i) => normalize(i.texto + i.n).includes(q)) : secao.itens;
  if (itens.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-md">
      <button
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <h3 className="font-display text-xl uppercase tracking-wide">{secao.titulo}</h3>
        <span className="font-display text-2xl text-primary">{aberto ? "–" : "+"}</span>
      </button>
      {aberto && (
        <ul className="space-y-4 border-t border-border px-6 py-5">
          {itens.map((i) => (
            <li key={i.n} className="text-sm leading-relaxed text-muted-foreground">
              <strong className="mr-2 font-bold text-primary">{i.n}</strong>
              {i.texto}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RegrasPage() {
  const [busca, setBusca] = useState("");
  const content: SiteContent = Route.useLoaderData();
  const cfg = content.settings;

  const build = (block: string): Secao[] =>
    content.sections
      .filter((s) => s.block === block)
      .map((s) => ({
        id: s.id,
        titulo: s.title,
        itens: content.rules
          .filter((r) => r.section_id === s.id)
          .map((r) => ({ n: r.code, texto: r.text })),
      }));

  const dbTermos = build("termos");
  const dbGerais = build("gerais");
  const termos = dbTermos.length ? dbTermos : termosFallback;
  const gerais = dbGerais.length ? dbGerais : geraisFallback;
  const categorias = content.categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? "",
  }));

  const acoes = content.actions.length
    ? content.actions.map((a) => ({
        porte: a.porte ?? "",
        nome: a.nome,
        bandidos: a.bandidos ?? 0,
        policia: a.policia ?? 0,
        regras: (a.regras ?? []) as string[],
      }))
    : acoesFallback;

  const acoesFiltradas = useMemo(() => {
    const q = normalize(busca);
    if (!q) return acoes;
    return acoes.filter((a) => normalize(a.nome + a.porte + a.regras.join(" ")).includes(q));
  }, [busca, acoes]);

  return (
    <div className="relative min-h-screen font-body text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="Logo Thug Life RJ" width={44} height={44} className="h-11 w-11 rounded-md object-cover ring-1 ring-primary/50" />
            <span className="font-display text-lg tracking-wide">{cfg["siteName"] || "THUG LIFE RJ"}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
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
        <h1 className="font-display text-4xl uppercase sm:text-5xl">{cfg["rulesTitle"] || "Regras e Termos"}</h1>
        <p className="mt-3 text-muted-foreground">
          {cfg["rulesIntro"] || "Documento oficial da Thug Life RJ. Leia com atenção antes de conectar na cidade."}
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card/80 p-5 backdrop-blur-md">
          <label htmlFor="busca" className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Pesquisar nas regras
          </label>
          <input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: metagaming, banco, refém, wipe..."
            className="mt-3 w-full rounded-md border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        <div className="mt-8 rounded-xl border border-primary/50 bg-card/85 p-6 shadow-[var(--shadow-glow)] backdrop-blur">
          <h2 className="font-display text-xl uppercase text-primary">Importante</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {cfg["rulesImportant"] ||
              "Ao entrar na Thug Life RJ você declara estar de acordo com os termos deste documento. O acesso ao servidor implica aceitação automática das normas descritas aqui, criadas para garantir uma convivência justa, segura e coerente com a proposta de roleplay."}
          </p>
        </div>

        <h2 className="mt-14 font-display text-3xl uppercase">Termos e Condições de Uso</h2>
        <div className="mt-6 space-y-4">
          {termos.map((s) => (
            <Bloco key={s.id} secao={s} busca={busca} />
          ))}
        </div>

        <h2 className="mt-14 font-display text-3xl uppercase">Regras Gerais do Roleplay</h2>
        <div className="mt-6 space-y-4">
          {gerais.map((s) => (
            <Bloco key={s.id} secao={s} busca={busca} />
          ))}
        </div>

        <h2 className="mt-14 font-display text-3xl uppercase">Categorias de Regras</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          As regras completas do servidor estão organizadas nestas categorias.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              to="/regras/$slug"
              params={{ slug: c.slug }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card/80 px-4 py-2 text-sm font-semibold uppercase tracking-wide backdrop-blur transition-colors hover:border-primary/70 hover:bg-primary/10 hover:text-primary"
            >
              {c.icon && <span aria-hidden>{c.icon}</span>}
              {c.name}
            </Link>
          ))}
        </div>


        <h2 className="mt-14 font-display text-3xl uppercase">Ações Disponíveis</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {acoesFiltradas.map((a) => (
            <article key={a.nome} className="rounded-xl border border-border bg-card/80 p-5 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{a.porte}</span>
              <h3 className="mt-1 font-display text-xl uppercase">{a.nome}</h3>
              <p className="mt-2 text-sm font-semibold">
                Bandidos: {a.bandidos} · Polícia: {a.policia}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {a.regras.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </article>
          ))}
          {acoesFiltradas.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma ação encontrada para essa busca.</p>
          )}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 rounded-xl border border-primary/50 bg-card/85 p-6 shadow-[var(--shadow-glow)] backdrop-blur">
          <div className="flex-1">
            <h2 className="font-display text-2xl uppercase">Dúvidas sobre alguma regra?</h2>
            <p className="text-sm text-muted-foreground">Fale com a equipe no Discord oficial.</p>
          </div>
          <a
            href="https://discord.gg/thugliferj"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-6 py-3 font-display text-lg uppercase text-primary-foreground"
            style={{ background: "var(--gradient-gold)" }}
          >
            Entrar no Discord
          </a>
        </div>
      </main>
    </div>
  );
}
