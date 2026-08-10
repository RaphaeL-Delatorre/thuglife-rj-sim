import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AccountsPanel, type Profile } from "@/components/dashboard/AccountsPanel";
import { CollectionPanel } from "@/components/dashboard/CollectionPanel";
import { RolesPanel, type Role } from "@/components/dashboard/RolesPanel";
import { RulesPanel, type RuleCategory, type RuleItem, type RuleSection } from "@/components/dashboard/RulesPanel";
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
  { key: "subtitle", label: "Subtítulo", type: "text", placeholder: "Diretrizes para sequestros, guerras..." },
  { key: "description", label: "Descrição curta", type: "textarea" },
  { key: "content_html", label: "Conteúdo da página (editor completo)", type: "richtext" },
  { key: "published", label: "Publicada no site", type: "switch" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const ACTION_FIELDS: FieldDef[] = [
  { key: "porte", label: "Porte", type: "text", placeholder: "Ex.: Pequeno Porte" },
  { key: "nome", label: "Nome da ação", type: "text" },
  { key: "bandidos", label: "Bandidos", type: "number" },
  { key: "policia", label: "Polícia", type: "number" },
  { key: "regras", label: "Regras (uma por linha)", type: "list" },
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
  const [tab, setTab] = useState<TabKey>("site");

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
          {query.error instanceof Error ? query.error.message : "Não foi possível carregar o painel."}
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

  const tabs: { key: TabKey; label: string; visible: boolean }[] = [
    { key: "site", label: "Site", visible: true },
    { key: "rules", label: "Regras", visible: true },
    { key: "categories", label: "Categorias", visible: true },
    { key: "actions", label: "Ações", visible: true },
    { key: "news", label: "Notícias", visible: true },
    { key: "faqs", label: "Dúvidas", visible: true },
    { key: "stats", label: "Estatísticas", visible: true },
    { key: "requirements", label: "Requisitos", visible: true },
    { key: "roles", label: "Cargos", visible: allow("roles.view") },
    { key: "accounts", label: "Contas", visible: allow("accounts.view") },
  ];

  const rows = (list: unknown[]) => list as RecordValues[];

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Painel administrativo</p>
            <h1 className="font-display text-2xl uppercase tracking-wide">Gerenciar o site</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-semibold">{data.me.displayName || data.me.email}</p>
              <p className="text-xs text-muted-foreground">{data.me.roleName ?? "Sem cargo"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              Desconectar
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
          {tabs
            .filter((t) => t.visible)
            .map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
        </nav>

        <div className="py-8">
          {tab === "site" && (
            <SettingsPanel settings={data.settings} canEdit={allow("site.edit")} onChanged={reload} />
          )}
          {tab === "rules" && (
            <RulesPanel
              sections={data.sections as RuleSection[]}
              rules={data.rules as RuleItem[]}
              categories={data.categories as RuleCategory[]}
              can={allow}
              onChanged={reload}
            />
          )}
          {tab === "categories" && (
            <div className="space-y-12">
              <CollectionPanel
                title="Categorias de regras (páginas)"
                description="Cada categoria vira uma página própria em /regras/endereço, com conteúdo escrito no editor completo."
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
              description="Assaltos e ações permitidas, com limites e regras."
              table="actions"
              permPrefix="actions"
              fields={ACTION_FIELDS}
              rows={rows(data.actions)}
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
              table="news"
              permPrefix="news"
              fields={NEWS_FIELDS}
              rows={rows(data.news)}
              columns={[
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
              table="faqs"
              permPrefix="faqs"
              fields={FAQ_FIELDS}
              rows={rows(data.faqs)}
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
              table="site_stats"
              permPrefix="stats"
              fields={STAT_FIELDS}
              rows={rows(data.stats)}
              columns={[
                { key: "value", label: "Valor" },
                { key: "label", label: "Rótulo" },
                { key: "sub", label: "Complemento" },
              ]}
              can={allow}
              onChanged={reload}
            />
          )}
          {tab === "requirements" && (
            <CollectionPanel
              title="Requisitos para jogar"
              table="requirements"
              permPrefix="requirements"
              fields={REQUIREMENT_FIELDS}
              rows={rows(data.requirements)}
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
      </div>
    </div>
  );
}
