import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { bootstrap } = await import("./admin.server");
  return bootstrap();
});

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadMe } = await import("./admin.server");
    return loadMe(context.userId);
  });

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadMe, loadAdminData } = await import("./admin.server");
    const me = await loadMe(context.userId);
    if (me.permissions.length === 0) throw new Error("Sua conta não possui um cargo com permissões.");
    return { me, ...(await loadAdminData()) };
  });

export const saveRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; id?: string | null; values: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const { looseAdmin, requirePerm, tablePerm } = await import("./admin.server");
    await requirePerm(context.userId, tablePerm(data.table, data.id ? "edit" : "create"));
    const values = { ...data.values };
    if (data.table === "rule_categories") {
      const raw = String(values["slug"] ?? "").trim() || String(values["name"] ?? "");
      values["slug"] = raw
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    const db = await looseAdmin();
    const { error } = data.id
      ? await db.from(data.table).update(values).eq("id", data.id)
      : await db.from(data.table).insert(values);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; id: string }) => data)
  .handler(async ({ data, context }) => {
    const { looseAdmin, requirePerm, tablePerm } = await import("./admin.server");
    await requirePerm(context.userId, tablePerm(data.table, "delete"));
    const db = await looseAdmin();
    const { error } = await db.from(data.table).delete().eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { values: Record<string, string> }) => data)
  .handler(async ({ data, context }) => {
    const { admin, requirePerm } = await import("./admin.server");
    await requirePerm(context.userId, "site.edit");
    const db = await admin();
    const { error } = await db
      .from("site_settings")
      .upsert({ key: "geral", value: data.values, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id?: string | null; name: string; description: string; permissions: string[] }) => data,
  )
  .handler(async ({ data, context }) => {
    const { admin, requirePerm } = await import("./admin.server");
    await requirePerm(context.userId, data.id ? "roles.edit" : "roles.create");
    if (!data.name.trim()) throw new Error("Informe o nome do cargo.");
    const db = await admin();
    const payload = {
      name: data.name.trim(),
      description: data.description,
      permissions: data.permissions,
    };
    const { error } = data.id
      ? await db.from("roles").update(payload).eq("id", data.id)
      : await db.from("roles").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { admin, requirePerm } = await import("./admin.server");
    await requirePerm(context.userId, "roles.delete");
    const db = await admin();
    const { data: role } = await db.from("roles").select("is_system").eq("id", data.id).maybeSingle();
    if (role?.is_system) throw new Error("Este cargo é do sistema e não pode ser excluído.");
    const { error } = await db.from("roles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string; password: string; roleId: string | null }) => data)
  .handler(async ({ data, context }) => {
    const { admin, requirePerm, emailFromName } = await import("./admin.server");
    await requirePerm(context.userId, "accounts.create");
    if (data.password.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");
    const { email, displayName } = emailFromName(data.name);
    const db = await admin();
    const created = await db.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (created.error || !created.data.user) throw new Error(created.error?.message ?? "Não foi possível criar a conta.");
    const { error } = await db.from("profiles").insert({
      id: created.data.user.id,
      email,
      display_name: displayName,
      role_id: data.roleId,
    });
    if (error) throw new Error(error.message);
    return { email };
  });

export const updateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; roleId: string | null; password?: string; displayName?: string }) => data)
  .handler(async ({ data, context }) => {
    const { admin, requirePerm } = await import("./admin.server");
    await requirePerm(context.userId, "accounts.edit");
    const db = await admin();
    if (data.password) {
      if (data.password.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");
      const res = await db.auth.admin.updateUserById(data.id, { password: data.password });
      if (res.error) throw new Error(res.error.message);
    }
    const patch: { role_id: string | null; display_name?: string } = { role_id: data.roleId };
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    const { error } = await db.from("profiles").update(patch).eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { admin, requirePerm } = await import("./admin.server");
    await requirePerm(context.userId, "accounts.delete");
    if (data.id === context.userId) throw new Error("Você não pode excluir a sua própria conta.");
    const db = await admin();
    await db.from("profiles").delete().eq("id", data.id);
    const res = await db.auth.admin.deleteUser(data.id);
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });
