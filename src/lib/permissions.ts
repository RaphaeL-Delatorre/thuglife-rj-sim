export type PermissionGroup = {
  label: string;
  items: { key: string; label: string }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Contas",
    items: [
      { key: "accounts.view", label: "Ver contas" },
      { key: "accounts.create", label: "Criar conta" },
      { key: "accounts.edit", label: "Editar conta" },
      { key: "accounts.delete", label: "Excluir conta" },
    ],
  },
  {
    label: "Cargos",
    items: [
      { key: "roles.view", label: "Ver cargos" },
      { key: "roles.create", label: "Criar cargo" },
      { key: "roles.edit", label: "Editar cargo" },
      { key: "roles.delete", label: "Excluir cargo" },
    ],
  },
  {
    label: "Regras",
    items: [
      { key: "rules.create", label: "Criar regra / seção" },
      { key: "rules.edit", label: "Editar regra / seção" },
      { key: "rules.delete", label: "Excluir regra / seção" },
    ],
  },
  {
    label: "Categorias de Regras",
    items: [
      { key: "rule_categories.create", label: "Criar categoria" },
      { key: "rule_categories.edit", label: "Editar categoria" },
      { key: "rule_categories.delete", label: "Excluir categoria" },
    ],
  },
  {
    label: "Ações Disponíveis",
    items: [
      { key: "actions.create", label: "Criar ação" },
      { key: "actions.edit", label: "Editar ação" },
      { key: "actions.delete", label: "Excluir ação" },
    ],
  },
  {
    label: "Notícias da cidade",
    items: [
      { key: "news.create", label: "Criar notícia" },
      { key: "news.edit", label: "Editar notícia" },
      { key: "news.delete", label: "Excluir notícia" },
    ],
  },
  {
    label: "Dúvidas frequentes",
    items: [
      { key: "faqs.create", label: "Criar dúvida" },
      { key: "faqs.edit", label: "Editar dúvida" },
      { key: "faqs.delete", label: "Excluir dúvida" },
    ],
  },
  {
    label: "Estatísticas",
    items: [
      { key: "stats.create", label: "Criar estatística" },
      { key: "stats.edit", label: "Editar estatística" },
      { key: "stats.delete", label: "Excluir estatística" },
    ],
  },
  {
    label: "Requisitos para jogar",
    items: [
      { key: "requirements.create", label: "Criar requisito" },
      { key: "requirements.edit", label: "Editar requisito" },
      { key: "requirements.delete", label: "Excluir requisito" },
    ],
  },
  {
    label: "Textos e configurações do site",
    items: [{ key: "site.edit", label: "Editar textos, links e seções do site" }],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

export function can(permissions: string[] | undefined, perm: string): boolean {
  if (!permissions) return false;
  return permissions.includes("*") || permissions.includes(perm);
}

export const TABLE_PERMISSION_PREFIX: Record<string, string> = {
  news: "news",
  faqs: "faqs",
  rule_categories: "rule_categories",
  rule_sections: "rules",
  rules: "rules",
  actions: "actions",
  site_stats: "stats",
  requirements: "requirements",
};

export const EDITABLE_TABLES = Object.keys(TABLE_PERMISSION_PREFIX);
