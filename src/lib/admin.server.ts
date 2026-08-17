import { TABLE_PERMISSION_PREFIX } from "./permissions";

export const EMAIL_DOMAIN = "thuglife.com";

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function requirePerm(userId: string, perm: string) {
  const db = await admin();
  const { data, error } = await db.rpc("has_permission", { _user_id: userId, _perm: perm });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Você não tem permissão para esta ação.");
}

export function tablePerm(table: string, action: "create" | "edit" | "delete") {
  const prefix = TABLE_PERMISSION_PREFIX[table];
  if (!prefix) throw new Error("Tabela não permitida.");
  return `${prefix}.${action}`;
}

export function emailFromName(name: string) {
  const clean = name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "");
  if (!clean) throw new Error("Informe um nome válido.");
  return { email: `${clean}@${EMAIL_DOMAIN}`, displayName: name.trim() };
}

export async function loadMe(userId: string) {
  const db = await admin();
  const { data } = await db
    .from("profiles")
    .select("id, email, display_name, role_id, roles(id, name, permissions)")
    .eq("id", userId)
    .maybeSingle();
  const role = (data?.roles ?? null) as { id: string; name: string; permissions: string[] } | null;
  return {
    id: userId,
    email: data?.email ?? "",
    displayName: data?.display_name ?? "",
    roleName: role?.name ?? null,
    permissions: role?.permissions ?? [],
  };
}

export async function loadAdminData() {
  const db = await admin();
  const [settings, stats, requirements, news, faqs, categories, sections, rules, actions, roles, profiles] =
    await Promise.all([
      db.from("site_settings").select("key, value").eq("key", "geral").maybeSingle(),
      db.from("site_stats").select("*").order("sort_order"),
      db.from("requirements").select("*").order("sort_order"),
      db.from("news").select("*").order("sort_order"),
      db.from("faqs").select("*").order("sort_order"),
      db.from("rule_categories").select("*").order("sort_order"),
      db.from("rule_sections").select("*").order("sort_order"),
      db.from("rules").select("*").order("sort_order"),
      db.from("actions").select("*").order("sort_order"),
      db.from("roles").select("*").order("created_at"),
      db.from("profiles").select("id, email, display_name, role_id, created_at").order("created_at"),
    ]);

  return {
    settings: (settings.data?.value ?? {}) as Record<string, string>,
    stats: stats.data ?? [],
    requirements: requirements.data ?? [],
    news: news.data ?? [],
    faqs: faqs.data ?? [],
    categories: categories.data ?? [],
    sections: sections.data ?? [],
    rules: rules.data ?? [],
    actions: actions.data ?? [],
    roles: roles.data ?? [],
    profiles: profiles.data ?? [],
  };
}

export async function bootstrap() {
  try {
    const db = await admin();
    const { data: existing } = await db
      .from("profiles")
      .select("id")
      .eq("email", `rbtl@${EMAIL_DOMAIN}`)
      .maybeSingle();
    if (existing) return { created: false };

    let { data: role } = await db.from("roles").select("id").eq("name", "Desenvolvedor").maybeSingle();
    if (!role) {
      const inserted = await db
        .from("roles")
        .insert({ name: "Desenvolvedor", description: "Acesso total ao painel e ao site.", permissions: ["*"], is_system: true })
        .select("id")
        .maybeSingle();
      role = inserted.data;
    }

    let createdUser: { id: string } | null = null;
    try {
      const created = await db.auth.admin.createUser({
        email: `rbtl@${EMAIL_DOMAIN}`,
        password: "123456",
        email_confirm: true,
      });
      if (created.data?.user) createdUser = created.data.user;
    } catch {
      const { data: signData } = await db.auth.signUp({
        email: `rbtl@${EMAIL_DOMAIN}`,
        password: "123456",
      });
      if (signData?.user) createdUser = signData.user;
    }

    if (createdUser) {
      await db.from("profiles").insert({
        id: createdUser.id,
        email: `rbtl@${EMAIL_DOMAIN}`,
        display_name: "RBTL",
        role_id: role?.id ?? null,
      });
      return { created: true };
    }
  } catch (err) {
    console.error("Bootstrap admin error:", err);
  }
  return { created: false };
}

type LooseResult = Promise<{ error: { message: string } | null }>;
type LooseDb = {
  from(table: string): {
    insert(values: Record<string, unknown>): LooseResult;
    update(values: Record<string, unknown>): { eq(column: string, value: string): LooseResult };
    delete(): { eq(column: string, value: string): LooseResult };
  };
};

export async function looseAdmin(): Promise<LooseDb> {
  return (await admin()) as unknown as LooseDb;
}
