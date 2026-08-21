import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  ExternalLink,
  FolderCog,
  HelpCircle,
  LayoutDashboard,
  Newspaper,
  Palette,
  RefreshCw,
  ScrollText,
  Settings2,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import { AccountsPanel, type Profile } from "@/components/dashboard/AccountsPanel";
import { CategoryMenusPanel } from "@/components/dashboard/CategoryMenusPanel";
import { CollectionPanel } from "@/components/dashboard/CollectionPanel";
import { RolesPanel, type Role } from "@/components/dashboard/RolesPanel";
import {
  RulesPanel,
  type RuleCategory,
  type RuleItem,
  type RuleSection,
} from "@/components/dashboard/RulesPanel";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import type { FieldDef, RecordValues } from "@/components/dashboard/fields";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAdminData } from "@/lib/admin.functions";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo" },
      { name: "description", content: "Gerenciamento completo do conteúdo do site." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel Administrativo" },
      { property: "og:description", content: "Gerenciamento completo do conteúdo do site." },
    ],
  }),
  component: DashboardPage,
});

const NEWS_FIELDS: FieldDef[] = [
  { key: "tag", label: "Etiqueta", type: "text", placeholder: "Ex.: Atualização" },
  { key: "title", label: "Título", type: "text" },
  { key: "body", label: "Texto", type: "textarea" },
  {
    key: "media_url",
    label: "Imagem ou vídeo da notícia",
    type: "media",
    mediaTypeKey: "media_type",
    hint: "Envie um arquivo do computador ou cole um link. A mídia aparece no topo do card da notícia.",
  },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const FAQ_FIELDS: FieldDef[] = [
  { key: "question", label: "Pergunta", type: "text" },
  { key: "answer", label: "Resposta", type: "textarea" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const CATEGORY_FIELDS: FieldDef[] = [
  { key: "name", label: "Nome da categoria", type: "text", placeholder: "Ex.: Regras de Ações" },
  {
    key: "slug",
    label: "Endereço da página",
    type: "text",
    placeholder: "regras-acoes",
    hint: "A página fica em /regras/o-que-você-digitar (use apenas letras minúsculas e hifens).",
  },
  { key: "icon", label: "Ícone / emoji", type: "text", placeholder: "Ex.: 🎯" },
  {
    key: "subtitle",
    label: "Subtítulo",
    type: "text",
    placeholder: "Diretrizes para sequestros, guerras...",
  },
  { key: "description", label: "Descrição curta", type: "textarea" },
  {
    key: "intro_html",
    label: "Mensagem do topo (antes dos menus)",
    type: "richtext",
    hint: "Aparece no início da página, fora da moldura dos menus.",
  },
  {
    key: "outro_html",
    label: "Mensagem final (depois dos menus)",
    type: "richtext",
    hint: "Aparece no fim da página, fora da moldura dos menus.",
  },
  { key: "published", label: "Publicada no site", type: "switch" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const ACTION_FIELDS: FieldDef[] = [
  { key: "porte", label: "Porte (grupo)", type: "text", placeholder: "Ex.: Pequeno Porte" },
  { key: "icon", label: "Ícone / emoji", type: "text", placeholder: "Ex.: 🏦" },
  { key: "nome", label: "Nome da ação", type: "text" },
  { key: "bandidos", label: "Bandidos", type: "number" },
  { key: "policia", label: "Polícia", type: "number" },
  { key: "regras", label: "Regras (uma por linha)", type: "list" },
  {
    key: "html",
    label: "Conteúdo do menu (editor completo)",
    type: "richtext",
    hint: "Se preenchido, aparece ao abrir o menu da ação no site.",
  },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const STAT_FIELDS: FieldDef[] = [
  { key: "value", label: "Valor", type: "text", placeholder: "Ex.: 10+" },
  { key: "label", label: "Rótulo", type: "text" },
  { key: "sub", label: "Complemento", type: "text" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const REQUIREMENT_FIELDS: FieldDef[] = [
  { key: "num", label: "Número", type: "text" },
  { key: "title", label: "Título", type: "text" },
  { key: "description", label: "Descrição", type: "textarea" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

type TabKey =
  | "overview"
  | "site"
  | "rules"
  | "categories"
  | "actions"
  | "news"
  | "faqs"
  | "stats"
  | "requirements"
  | "roles"
  | "accounts";

function DashboardPage() {
  const navigate = useNavigate();
  const fetchData = useServerFn(getAdminData);
  const [tab, setTab] = useState<TabKey>("overview");

  const query = useQuery({ queryKey: ["admin-data"], queryFn: () => fetchData(), retry: false });

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando painel...
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-5 text-center">
        <h1 className="font-display text-2xl uppercase">Acesso indisponível</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {query.error instanceof Error
            ? query.error.message
            : "Não foi possível carregar o painel."}
        </p>
        <Button variant="outline" onClick={signOut}>
          Sair
        </Button>
      </div>
    );
  }

  const data = query.data;
  const perms = data.me.permissions;
  const allow = (perm: string) => can(perms, perm);
  const reload = () => void query.refetch();

  const tabs: {
    key: TabKey;
    label: string;
    visible: boolean;
    group: string;
    icon: typeof LayoutDashboard;
  }[] = [
    {
      key: "overview",
      label: "Visão geral",
      visible: true,
      group: "Principal",
      icon: LayoutDashboard,
    },
    { key: "site", label: "Configurações", visible: true, group: "Principal", icon: Settings2 },
    { key: "news", label: "Notícias", visible: true, group: "Conteúdo", icon: Newspaper },
    { key: "rules", label: "Regras", visible: true, group: "Conteúdo", icon: ScrollText },
    { key: "categories", label: "Categorias", visible: true, group: "Conteúdo", icon: FolderCog },
    { key: "actions", label: "Ações", visible: true, group: "Conteúdo", icon: ShieldCheck },
    { key: "faqs", label: "Dúvidas", visible: true, group: "Conteúdo", icon: HelpCircle },
    { key: "stats", label: "Estatísticas", visible: true, group: "Conteúdo", icon: BarChart3 },
    {
      key: "requirements",
      label: "Requisitos",
      visible: true,
      group: "Conteúdo",
      icon: ClipboardCheck,
    },
    {
      key: "roles",
      label: "Cargos",
      visible: allow("roles.view"),
      group: "Administração",
      icon: UserCog,
    },
    {
      key: "accounts",
      label: "Contas",
      visible: allow("accounts.view"),
      group: "Administração",
      icon: UsersRound,
    },
  ];

  const rows = (list: unknown[]) => list as RecordValues[];
  const visibleTabs = tabs.filter((item) => item.visible);
  const tabGroups = [...new Set(visibleTabs.map((item) => item.group))];

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Central de controle
            </p>
            <h1 className="font-display text-2xl uppercase tracking-wide">Painel do site</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver site
            </a>
            <Button variant="outline" size="sm" onClick={reload} disabled={query.isFetching}>
              <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />{" "}
              Atualizar
            </Button>
            <div className="hidden border-l border-border pl-3 text-right text-sm sm:block">
              <p className="font-semibold">{data.me.displayName || data.me.email}</p>
              <p className="text-xs text-muted-foreground">{data.me.roleName ?? "Sem cargo"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-6 px-5 py-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-8">
        <aside className="hidden h-fit rounded-2xl border border-border bg-card/75 p-3 shadow-[var(--shadow-card)] lg:sticky lg:top-6 lg:block">
          <div className="border-b border-border px-3 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Navegação
            </p>
          </div>
          <nav className="mt-3 space-y-4">
            {tabGroups.map((group) => (
              <div key={group}>
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {group}
                </p>
                <div className="grid gap-1">
                  {visibleTabs
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => setTab(item.key)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                            tab === item.key
                              ? "bg-primary text-primary-foreground shadow"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" /> {item.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <nav className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden">
            {visibleTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    tab === t.key
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </nav>

          <div className="py-2 lg:py-0">
            {tab === "overview" && (
              <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-primary/30 bg-card/80 shadow-[var(--shadow-card)]">
                  <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--primary),_transparent_58%)] px-6 py-8 sm:px-8">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                      Visão geral
                    </p>
                    <h2 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-4xl">
                      Tudo sob controle
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                      Use os atalhos para publicar conteúdo ou ajustar a página inicial. As
                      alterações são salvas somente quando você confirma a publicação.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button onClick={() => setTab("news")}>
                        <Newspaper className="h-4 w-4" /> Nova notícia
                      </Button>
                      <Button variant="outline" onClick={() => setTab("site")}>
                        <Settings2 className="h-4 w-4" /> Ajustar site
                      </Button>
                      <Button variant="outline" onClick={() => setTab("rules")}>
                        <ScrollText className="h-4 w-4" /> Editar regras
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Notícias",
                      value: data.news.length,
                      detail: "cards publicados ou em edição",
                      icon: Newspaper,
                    },
                    {
                      label: "Categorias",
                      value: data.categories.length,
                      detail: "páginas de regras",
                      icon: FolderCog,
                    },
                    {
                      label: "Ações",
                      value: data.actions.length,
                      detail: "ações cadastradas",
                      icon: ShieldCheck,
                    },
                    {
                      label: "Dúvidas",
                      value: data.faqs.length,
                      detail: "respostas rápidas",
                      icon: HelpCircle,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border bg-card/75 p-5 shadow-[var(--shadow-card)]"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <p className="mt-5 font-display text-4xl text-foreground">{item.value}</p>
                        <p className="mt-1 text-sm font-semibold uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    );
                  })}
                </section>

                <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-border bg-card/75 p-6 shadow-[var(--shadow-card)]">
                    <h3 className="font-display text-xl uppercase tracking-wide">
                      Atalhos de publicação
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          label: "Notícias da cidade",
                          text: "Crie cards com imagem ou vídeo.",
                          tab: "news" as TabKey,
                          icon: Newspaper,
                        },
                        {
                          label: "Imagens de fundo",
                          text: "Envie arquivos e defina o tempo da rotação.",
                          tab: "site" as TabKey,
                          icon: Palette,
                        },
                        {
                          label: "Categorias de regras",
                          text: "Organize as páginas e menus de regras.",
                          tab: "categories" as TabKey,
                          icon: FolderCog,
                        },
                        {
                          label: "Ações disponíveis",
                          text: "Atualize limites e condições das ações.",
                          tab: "actions" as TabKey,
                          icon: ShieldCheck,
                        },
                      ].map((shortcut) => {
                        const Icon = shortcut.icon;
                        return (
                          <button
                            key={shortcut.label}
                            onClick={() => setTab(shortcut.tab)}
                            className="flex items-start gap-3 rounded-xl border border-border bg-background/30 p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>
                              <span className="block text-sm font-semibold">{shortcut.label}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {shortcut.text}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/75 p-6 shadow-[var(--shadow-card)]">
                    <h3 className="font-display text-xl uppercase tracking-wide">Como publicar</h3>
                    <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          1
                        </span>
                        <span>Escolha uma área pelo menu lateral ou pelos atalhos.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          2
                        </span>
                        <span>Faça os ajustes, envie arquivos quando necessário e salve.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          3
                        </span>
                        <span>Use “Ver site” para conferir a publicação em uma nova aba.</span>
                      </li>
                    </ol>
                  </div>
                </section>
              </div>
            )}
            {tab === "site" && (
              <SettingsPanel
                settings={data.settings}
                canEdit={allow("site.edit")}
                onChanged={reload}
              />
            )}
            {tab === "rules" && (
              <RulesPanel
                sections={data.sections as RuleSection[]}
                rules={data.rules as RuleItem[]}
                settings={data.settings as Record<string, string>}
                can={allow}
                onChanged={reload}
              />
            )}
            {tab === "categories" && (
              <div className="space-y-12">
                <CollectionPanel
                  title="Categorias de regras (páginas)"
                  description="Cada categoria vira uma página própria em /regras/endereço, com conteúdo escrito no editor completo."
                  addLabel="Nova categoria"
                  emptyLabel="Nenhuma categoria criada ainda."
                  table="rule_categories"
                  permPrefix="rule_categories"
                  fields={CATEGORY_FIELDS}
                  rows={rows(data.categories)}
                  columns={[
                    { key: "icon", label: "Ícone" },
                    { key: "name", label: "Nome" },
                    { key: "slug", label: "Endereço" },
                    { key: "published", label: "Publicada" },
                    { key: "sort_order", label: "Ordem" },
                  ]}
                  can={allow}
                  onChanged={reload}
                />
                <CategoryMenusPanel
                  categories={data.categories as RuleCategory[]}
                  sections={data.sections as RuleSection[]}
                  rules={data.rules as RuleItem[]}
                  can={allow}
                  onChanged={reload}
                />
              </div>
            )}

            {tab === "actions" && (
              <CollectionPanel
                title="Ações disponíveis"
                description="Assaltos e ações permitidas, com limites de bandidos, polícia e regras."
                table="actions"
                permPrefix="actions"
                fields={ACTION_FIELDS}
                rows={rows(data.actions)}
                addLabel="Nova ação"
                emptyLabel="Nenhuma ação cadastrada ainda."
                columns={[
                  { key: "porte", label: "Porte" },
                  { key: "nome", label: "Ação" },
                  { key: "bandidos", label: "Bandidos" },
                  { key: "policia", label: "Polícia" },
                ]}
                can={allow}
                onChanged={reload}
              />
            )}
            {tab === "news" && (
              <CollectionPanel
                title="Notícias da cidade"
                description="Cada notícia vira um card na página inicial. Adicione imagem ou vídeo por arquivo do computador ou link."
                table="news"
                permPrefix="news"
                fields={NEWS_FIELDS}
                rows={rows(data.news)}
                addLabel="Nova notícia"
                emptyLabel="Nenhuma notícia publicada ainda. Crie a primeira para aparecer no site."
                columns={[
                  { key: "media_url", label: "Mídia" },
                  { key: "tag", label: "Etiqueta" },
                  { key: "title", label: "Título" },
                  { key: "sort_order", label: "Ordem" },
                ]}
                can={allow}
                onChanged={reload}
              />
            )}
            {tab === "faqs" && (
              <CollectionPanel
                title="Dúvidas frequentes"
                description="Perguntas e respostas exibidas na seção de dúvidas da página inicial."
                table="faqs"
                permPrefix="faqs"
                fields={FAQ_FIELDS}
                rows={rows(data.faqs)}
                addLabel="Nova dúvida"
                emptyLabel="Nenhuma dúvida cadastrada ainda."
                columns={[
                  { key: "question", label: "Pergunta" },
                  { key: "sort_order", label: "Ordem" },
                ]}
                can={allow}
                onChanged={reload}
              />
            )}
            {tab === "stats" && (
              <CollectionPanel
                title="Estatísticas do topo"
                description="Números exibidos abaixo do título principal (ex.: anos no ar, jogadores)."
                table="site_stats"
                permPrefix="stats"
                fields={STAT_FIELDS}
                rows={rows(data.stats)}
                addLabel="Nova estatística"
                emptyLabel="Nenhuma estatística cadastrada ainda."
                columns={[
                  { key: "value", label: "Valor" },
                  { key: "label", label: "Rótulo" },
                  { key: "sub", label: "Complemento" },
                  { key: "sort_order", label: "Ordem" },
                ]}
                can={allow}
                onChanged={reload}
              />
            )}
            {tab === "requirements" && (
              <CollectionPanel
                title="Requisitos para jogar"
                description="Passos que o jogador precisa cumprir para entrar na cidade."
                table="requirements"
                permPrefix="requirements"
                fields={REQUIREMENT_FIELDS}
                rows={rows(data.requirements)}
                addLabel="Novo requisito"
                emptyLabel="Nenhum requisito cadastrado ainda."
                columns={[
                  { key: "num", label: "Nº" },
                  { key: "title", label: "Título" },
                  { key: "sort_order", label: "Ordem" },
                ]}
                can={allow}
                onChanged={reload}
              />
            )}
            {tab === "roles" && allow("roles.view") && (
              <RolesPanel roles={data.roles as Role[]} can={allow} onChanged={reload} />
            )}
            {tab === "accounts" && allow("accounts.view") && (
              <AccountsPanel
                profiles={data.profiles as Profile[]}
                roles={data.roles as Role[]}
                can={allow}
                onChanged={reload}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
